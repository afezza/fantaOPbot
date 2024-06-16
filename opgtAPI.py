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

# teams_id = ["9938","9346","9960","9946","9940","9941"]
# chapter_id = ['1111','1112','1113','1114','1115','1116','1117']

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
        match['state'] = "WAIT_CHAPTER"
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
                logger.info("Role does not exist")
            elif(role_res[0].text.strip() == ""): #questo serve quando i voti non sono stati ancora pubblicati
                role_res = root.xpath(role_query_plus) 
                if not role_res:
                    logger.info("Role does not exist")

            name_res = root.xpath(name_query) 
            if not name_res:
                logger.info("Name does not exist")

            cap_vice_res = root.xpath(cap_vice_query) 
            if not cap_vice_res:
                logger.info("Cap does not exist")

            actual_squad = {"team": team['team_id'], "total_score": "0" ,"players": []}
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
    team_id = team_name_list[team['team_id']]
    for team in match_list[day]['squads']:
        text_answer += "\n<u>Team "+ team_id + "</u>: "+ team['total_score'] + "\n"
        for player in team['players']:
            text_answer += " &#8226 "+ player['name'] + ":\n"
            text_answer += " { "+ player['score'] + "}\n"
    return text_answer

def retrieve_rank_from_app(chapter_id):
    
    # Create the chapter object
    chapter = {"chapter": chapter_id, "squads": []}
    
    # Start creating the answer
    text_answer = "<b>Capitolo "+ chapter_id + "</b>:"
    
    # Retrieve the info from the web
    http_response = http.request('GET',
                                "https://www.opgt.it/fantaop/voti/analisi/?capitolo="+chapter_id,
                                retries = False)
    print(http_response.data)

    # Parse and query the web page
    root = etree.HTML(http_response.data)
    
    name_res = root.xpath(vote_name_query) 
    if not name_res:
        print("Name does not exist")
    
    vote_score_res = root.xpath(vote_score_query) 
    if not vote_score_res:
        print("Score does not exist")

    for i in range(len(name_res)):
        # logger.info(name_res[i][0].text.strip())
        text_answer += "\n" + name_res[i][0].text.strip() + "\n"
        for j in range(len(vote_score_res[i])-1):
            text_answer += vote_score_res[i][j][0].text   

    return text_answer
