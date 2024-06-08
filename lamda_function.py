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
        message = telegramAPI.deserialize(event)
        
        if(telegramAPI.BOT_NAME in message['text']):    # Ignoro i messaggi che non sono destinati al bot
            bot_reply = fantaOP.exec_command(message['text'],message['user_id'])
            
            # Invio la risposta alla chat
            telegramAPI.sendMessage(message['chat_id'],bot_reply)                
    except Exception as e: 
        logger.setLevel("ERROR")
        # print("[ERR] exception happened =>" + traceback.format_exc())
        # logging.error('Error at %s', 'division', exc_info=e)
        logging.error(e)
        
    return {
        'statusCode': 200,
        'body': json.dumps('Hello from Lambda!')
    }
