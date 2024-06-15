"""
OPGT API python interface
"""
import json
import urllib3
import logging
from lxml import etree

logger = logging.getLogger()

# HTTP env init 
http = urllib3.PoolManager()

teams_id = ["9938","9346","9960","9946","9940","9941"]
chapter_id = ['1111','1112','1113','1114','1115','1116','1117']

role_query = "//div[@class='col-sm-2 col-xs-4']"
role_query_plus = "//div[@class='col-sm-2 col-xs-4']//option[@selected='selected']"
name_query = "//div[@class='col-sm-4 col-xs-4']"
cap_vice_query = "//div[@class='col-sm-1 col-xs-1 text-center']"    

vote_name_query = "//div[@class='col-xs-9 col-sm-4']"
vote_score_query = "//div[@class='col-xs-12 col-sm-6 text-right']"   

# http_response = requests.get("https://www.opgt.it/fantaop/squadre/formazione/?id_squadra=9938&capitolo=1111")
# http_response = requests.get("https://www.opgt.it/fantaop/squadre/formazione/?id_squadra="+ teams_id[2] +"&capitolo="+ chapter_id[1])
# print(http_response.text)

def retrieve_squads_from_app(chapter_id):
    
    # Create the chapter object
    chapter = {"chapter": chapter_id, "squads": []}
    
    # Start creating the answer
    text_answer = "<b>Capitolo "+ chapter_id + "</b>:"
    
    # Retrieve the info from the web
    for item in teams_id:
        
        http_response = http.request('GET',
                        "https://www.opgt.it/fantaop/squadre/formazione/?id_squadra="+ item +"&capitolo="+ chapter_id,
                        retries = False)
        print(http_response.data)
        
        # Parse and query the web page
        root = etree.HTML(http_response.data)
        role_res = root.xpath(role_query) 
        if not role_res:
            print("Role does not exist")
        elif(role_res[0].text.strip() == ""): #questo serve quando i voti non sono stati ancora pubblicati
            role_res = root.xpath(role_query_plus) 
            if not role_res:
                print("Role does not exist")
       
        name_res = root.xpath(name_query) 
        if not name_res:
            print("Name does not exist")
        
        cap_vice_res = root.xpath(cap_vice_query) 
        if not cap_vice_res:
            print("Cap does not exist")
     
        actual_squad = {"team": item, "players": []}
        text_answer += "\n    <i>Team "+ item + "</i>:"
        for i in range(len(role_res)):
            actual_char = {"name": name_res[i][0].text.strip(), "role": role_res[i].text.strip()}
            if(cap_vice_res[(i*2)].text.strip() == "Capitano"):
                actual_char['role'] = cap_vice_res[(i*2)].text.strip()
            elif(cap_vice_res[(i*2)+1].text.strip() == "Vice"):
                actual_char['role'] = cap_vice_res[(i*2)+1].text.strip()
            
            actual_squad['players'].append(actual_char)
            text_answer += "\n        -"+ actual_char['role'] + " -> "+ actual_char['name']
    
        chapter['squads'].append(actual_squad)
        
    # return str(json.dumps(chapter))
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
