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

class BotMessage:
    def __init__(self, *,request:str=None, text:str=None, chat_id:str=None, user_id:str=None):
        """Create a bot message with the information provided in input. 
        
        The input can be take either from the json string received input or 
        passing the single parameters. 

        If both the json string and the parameters (or none of them) are provided 
        an exception is raised.

        If the inputs are provided correctly a message object contains the following 
        is returned:

        - request : store the json string provided in input (if provided), None otherwise 
        - text : text from the request (if provided), input parameter otherwise (if provided) 
        - chat_id : chat id from the request (if provided), input parameter otherwise (if provided) 
        - chat_type : chat type from the request (if provided), None otherwise 
        - user_id : user id from the request (if provided), input parameter otherwise (if provided) 
        - parse_mode : the way the client parse the formatted text

        Parameters:
        request : json string containing the received input from the telegram client
        text : text to send to the telegram client
        chat_id : chat id to send the text to

        Returns:
        Exception: raise an exception if the inputs are pased in the wrong way
        """

        if(request is None): # Case in which none of the inputs are provided
            if(text is None and chat_id is None and user_id is None):   
                raise Exception('Please provide at least one of the arguments')
            else:
                self.request = None
                self.text = text
                self.chat_id = chat_id
                self.chat_type = None
                self.user_id = user_id
                self.parse_mode = "HTML"
        else:                               # Case in which both inputs are provided
            if(text is not None or chat_id is not None or user_id is not None):
                raise Exception('Too many arguments provided')
            else:
                data = json.loads(request)    

                self.request = request
                self.text = str(data["message"].get("text"))
                self.chat_id = str(data["message"]["chat"]["id"])
                self.chat_type = str(data["message"]["chat"]["type"])
                self.user_id = str(data["message"]["from"]["username"])
                self.parse_mode = "HTML"

    def sendMessage(self):
        """Send a message to the telegram client. 
        
        The text of the message is sent to the chat specified in chat id.
        """
        reponse_payload = json.dumps({'text': self.text,    # Costruisco la risposta da inviare alla chat
                                    'chat_id': self.chat_id, 
                                    'parse_mode': self.parse_mode})
        url = BASE_URL + "/sendMessage"                     # Seleziono l'API corretta
        http_response = http.request('POST',                # Effettuo la richiesta http
                                    url,
                                    body = reponse_payload,
                                    headers = {'Content-Type': 'application/json'},
                                    retries = False)
        logger.info(http_response.data)