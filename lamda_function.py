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
        logger.info("Received: " + rcvd_message.text + " from chat: " + rcvd_message.chat_id)
        
        if(telegramAPI.BOT_NAME in rcvd_message.text):    # Ignoro i messaggi che non sono destinati al bot
            bot_reply = fantaOP.exec_command(rcvd_message.text,rcvd_message.user_id)
            reply_message = telegramAPI.BotMessage(text=bot_reply,chat_id=rcvd_message.chat_id)
            
            reply_message.sendMessage() # Invio la risposta alla chat               
    except Exception as e: 
        logger.setLevel("ERROR")
        # print("[ERR] exception happened =>" + traceback.format_exc())
        # logging.error('Error at %s', 'division', exc_info=e)
        logging.error(e)
        
    return {
        'statusCode': 200,
        'body': json.dumps('Hello from Lambda!')
    }
