import json
import logging

import fantaOP
import telegramAPI

# Logger init
logger = logging.getLogger()
logger.setLevel("INFO")

def lambda_handler(event, context):
    
    logger.info(event)
    try:
        rcvd_message = telegramAPI.BotMessage(request=event["body"]) # Take the json string of the content from the input event 
        
        if(telegramAPI.BOT_NAME in rcvd_message.text):    # Ignoro i messaggi che non sono destinati al bot
            bot_reply = fantaOP.run_command(rcvd_message)
            bot_reply.sendMessage() # Invio la risposta alla chat               
    except Exception as e: 
        logger.setLevel("ERROR")
        logging.error(e)
        
    return {
        'statusCode': 200,
        'body': json.dumps('Hello from Lambda!')
    }
