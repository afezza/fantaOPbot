"""
OPGT API python interface
"""
import json
import urllib3
import logging
from lxml import etree

import dynamodbAPI

logger = logging.getLogger()

# HTTP env init 
http = urllib3.PoolManager()

role_query = "//div[@class='col-sm-2 col-xs-4']"
role_query_plus = "//div[@class='col-sm-2 col-xs-4']//option[@selected='selected']"
name_query = "//div[@class='col-sm-4 col-xs-4']"
cap_vice_query = "//div[@class='col-sm-1 col-xs-1 text-center']"    

vote_name_query = "//div[@class='col-xs-9 col-sm-4']"
vote_score_query = "//div[@class='col-xs-12 col-sm-6 text-right']"   

def retrieve_squads_from_app(key:str,db_entry):
    """Connects to OPGT web app to download the list of squads inserted by users 
        and store it on the database.

        Parameters:
        key : chat id of the corresponding tournment
        db_entry : data of the corresponding tournment stored on the database 

        Returns:
        text_match_answer : the squads retrieved from the web app 
    """
    # Create a list for the matches and the teams from db entry
    match_list = json.loads(db_entry['Item']['match_list']) 
    team_list = json.loads(db_entry['Item']['teams']) 

    # Find in the list the first unplayed match
    for match in match_list:
        if(match['state'] != "None"):
            continue
        
        text_answer = "<b>Capitolo "+ match['chapter'] + "</b>:\n"
        
        # Update match state 
        match['state'] = "WAIT_RANKING"
        match['squads'] = []

        # Retrieve the info from the web app per each team in the list
        for team in team_list:
            url = "https://www.opgt.it/fantaop/squadre/formazione/?id_squadra=" + team['team_id'] +"&capitolo="+ match['chapter']
            http_response = http.request('GET',url,retries = False)
            # logger.info(http_response.data)
            
            # Parse and query the web page
            root = etree.HTML(http_response.data)

            role_res = root.xpath(role_query) 
            if not role_res:
                logger.error("Role does not exist")
            elif(role_res[0].text.strip() == ""): #questo serve quando i voti non sono stati ancora pubblicati
                role_res = root.xpath(role_query_plus) 
                if not role_res:
                    logger.error("Role does not exist")

            name_res = root.xpath(name_query) 
            if not name_res:
                logger.error("Name does not exist")

            cap_vice_res = root.xpath(cap_vice_query) 
            if not cap_vice_res:
                logger.error("Cap does not exist")
            else:   #questo serve quando i voti non sono stati ancora pubblicati
                for i in range(len(name_res)):
                    # logging.info(cap_vice_res[(i*2)][-1].attrib)
                    try:
                        cap_vice_res[(i*2)][-1].attrib['checked']
                        cap_vice_res[(i*2)].text = "Capitano"
                    except:
                        logging.error("Exception happened for capitano")
                    try:
                        cap_vice_res[(i*2)+1][-1].attrib['checked']
                        cap_vice_res[(i*2)+1].text= "Vice"
                    except:
                        logging.error("Exception happened for vice")

            actual_squad = {"team_id": team['team_id'], "total_score": "0" ,"players": []}
            text_answer += "\n<u>Team "+ team['team_name'] + "</u>:\n"
            for i in range(len(role_res)):
                actual_player = {"name": name_res[i][0].text.strip(), 
                                "role": role_res[i].text.strip(),
                                "score" : "None"}
                if(cap_vice_res[(i*2)].text.strip() == "Capitano"):
                    actual_player['role'] = cap_vice_res[(i*2)].text.strip()
                elif(cap_vice_res[(i*2)+1].text.strip() == "Vice"):
                    actual_player['role'] = cap_vice_res[(i*2)+1].text.strip()
                
                actual_squad['players'].append(actual_player)
                text_answer += "* "+ actual_player['name'] + ": "+ actual_player['role'] + "\n"
        
            match['squads'].append(actual_squad)
        break

    # Store data on database
    dynamodbAPI.update_db_column(key,'match_list', match_list)

    return text_answer

def retrieve_squads_from_db(key:str,db_entry,day):
    """Loads the list of squads stored on the database.

        Parameters:
        key : chat id of the corresponding tournment
        db_entry : data of the corresponding tournment stored on the database 
        chapter : the chapter to be retrieved 

        Returns:
        text_match_answer : the squads retrieved from the web app 
    """
    # Create a list for the matches and the teams from db entry
    match_list = json.loads(db_entry['Item']['match_list']) 
    team_list = json.loads(db_entry['Item']['teams']) 

    team_name_list = {}
    for team in team_list:
        team_name_list[team['team_id']]=team['team_name']
    
    # Find in the list the first unplayed match
    if(day > len(match_list)):
        return "Mi dispiace ma la giornata richiesta non esiste"
    
    text_answer = "<b>Capitolo "+ match_list[day]['chapter'] + "</b>:\n"

    # Retrieve the info from the database per each team in the list
    for team in match_list[day]['squads']:
        team_id = team_name_list[team['team_id']]
        text_answer += "\n<u>Team "+ team_id + "</u>: "+ team['total_score'] + "\n"
        for player in team['players']:
            text_answer += " &#8226 "+ player['name'] + ": ("+player['role'] + ")\n"
            text_answer += " { "+ str(player['score']) + "}\n"
    return text_answer


def retrieve_rank_from_app(key:str,db_entry):
    """Connects to OPGT web app to download the list of rank for the players 
        and store it on the database.

        Parameters:
        key : chat id of the corresponding tournment
        db_entry : data of the corresponding tournment stored on the database 

        Returns:
        text_match_answer : the ranks retrieved from the web app 
    """
    # Create a list for the matches and the teams from db entry
    match_list = json.loads(db_entry['Item']['match_list']) 
    team_list = json.loads(db_entry['Item']['teams']) 

    team_name_list = {}
    for team in team_list:
        team_name_list[team['team_id']]=team['team_name']
    
    # Find in the list the first unplayed match
    match_count = 0
    for match in match_list:
        if(match['state'] != "WAIT_RANKING"):
            match_count += 1
            continue
    
        # Start creating the answer
        text_answer = "<b>Capitolo "+ match['chapter'] + "</b>:"
    
        # Retrieve the info from the web
        http_response = http.request('GET',
                                    "https://www.opgt.it/fantaop/voti/analisi/?capitolo=" + match['chapter'],
                                    retries = False)
        logging.info(http_response.data)

        # Parse and query the web page
        root = etree.HTML(http_response.data)
        
        name_res = root.xpath(vote_name_query) 
        if not name_res:
            logging.info("Name does not exist")
            return "I voti non sono ancora stati pubblicati"

        vote_score_res = root.xpath(vote_score_query) 
        if not vote_score_res:
            print("Score does not exist")

        # Search for the players rank in the retrieved list
        for team in match['squads']:
            team['total_score'] = "0"   # This should not be needed 
            team_id = team_name_list[team['team_id']]
            text_answer += "\n<u>Team "+ team_id + "</u>: "
            score_index = len(text_answer)
            player_counter = 0
            reserve_rank_list = [0.0, 0.0, 0.0]
            text_answer += "\n"

            for player in team['players']:
                ranked_list_len = len(name_res)
                i = 0
                while i < ranked_list_len:
                    if(name_res[i][0].text.strip() == player['name']):
                        text_answer += " &#8226 "+ player['name'] + ": ("+player['role'] + ")\n"
                        player['score'] = {}
                        for j in range(len(vote_score_res[i])-1):
                            name = vote_score_res[i][j][0].text.split()[0]
                            rank = vote_score_res[i][j][0].text.split()[1].replace('(','').replace(')','')
                            player['score'][name] = rank
                            if(player['role'] == "Capitano"):
                                rank = str(float(rank) * 2)
                            elif(player['role'] == "Vice"):
                                rank = str(float(rank) * 1.5)
                            elif("riserva" in player['role']):
                                reserve_rank_list[int(player['role'][0])-1] += float(rank)
                                rank = '0'
                            team['total_score'] = str(float(team['total_score']) + float(rank))
                        text_answer += str(player['score']) + "\n"
                        player_counter += 1
                        name_res.pop(i)
                        vote_score_res.pop(i)
                        ranked_list_len -= 1
                    else:
                        i += 1

            for rank in reserve_rank_list:
                if ( rank == 0.0 ):
                    continue
                if (player_counter < 7):
                    team['total_score'] = str(float(team['total_score']) + rank)
                    player_counter += 1
    
            text_answer = text_answer[:score_index] + team['total_score'] + text_answer[score_index:]  
        # Update match state 
        match['state'] = "WAIT_CONFIRMATION"
        # Store data on database
        dynamodbAPI.update_db_column(key,'match_list', match_list)
        return text_answer

    return "Impossibile scaricare i voti"
