"""
Telegram API python interface
"""
import json
import urllib3
import logging

import tokens 

logger = logging.getLogger()
# Telegram env init
BASE_URL = 'https://api.telegram.org/bot'+ tokens.TELEGRAM_TOKEN
BOT_NAME = '@FantaOnePiecebot'

# HTTP env init 
http = urllib3.PoolManager()

def deserialize(event):
    
    data = json.loads(event["body"])
    
    message ={'text': str(data["message"].get("text")),    # Costruisco la risposta da inviare alla chat
              'chat_id': data["message"]["chat"]["id"], 
              'chat_type': data["message"]["chat"]["type"], 
              'user_id': data["message"]["from"]["username"]}
    return message

def sendMessage(chat_id,bot_reply):
    
    reponse_payload = json.dumps({'text': bot_reply,    # Costruisco la risposta da inviare alla chat
                                  'chat_id': chat_id, 
                                  'parse_mode': 'HTML'})
    url = BASE_URL + "/sendMessage"                     # Seleziono l'API corretta
    http_response = http.request('POST',                # Effettuo la richiesta http
                                url,
                                body = reponse_payload,
                                headers = {'Content-Type': 'application/json'},
                                retries = False)
    # print(http_response.data)    
    logger.info(http_response.data)