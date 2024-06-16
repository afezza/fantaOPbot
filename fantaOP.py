"""
Fanta One Piece bot library
"""
import json
import logging
import random

import opgtAPI
import dynamodbAPI
import telegramAPI

logger = logging.getLogger()

not_auth_answers = ["Spiacente pezzente non hai il permesso di farlo!",
                    "Va a papparti qualche fiore!!",
                    "Hai davvero pensato che ci saresti riuscito?! Patetico!!"]

# Public Functions
###
# Helper function to explain the user how to use the bot
# and which commands can be used.
###
def print_bot_command_list():
    text_answer = "Questo è l'elenco dei comandi:\n"
    text_answer += "/asta_apri -- Pulisce l'elenco svincolati e apre l'asta\n"
    text_answer += "/asta_risultati -- Chiude l'asta e mostra i risultati\n"
    text_answer += "/asta_svincola -- Permette di svincolare i personaggi\n"
    text_answer += "/asta_offri -- Permette di offrire per i personaggi\n"
    text_answer += "/asta_stato -- Controlla lo stato dell'asta\n"
    text_answer += "/formazione [DEV] -- Permette di controllare le formazioni\n"

    return text_answer

#Asta functions
###
# Get information about the auction
###
def retrieve_asta_results(key,response):
    try:
        lista_buste_text = response['Item']['buste_asta']   # Get the list from the table 
        #logger.info(lista_buste_text)
        lista_buste = json.loads(lista_buste_text)  # make a python list from the json
        lista_buste['is_open'] = "False"
        dynamodbAPI.update_db_column(key,'buste_asta', lista_buste)
        text_answer = "<b>Risultati:</b>\n"
        for busta in lista_buste['buste']:                   # find the user and update the busta
            text_answer += "<u>"+busta["user"]+":</u>\n"
            logger.info(text_answer)

            if (busta["svincolati"] != "None"):
                text_answer += busta["svincolati"].replace(",","\n") + "\n\n"
            else:
                text_answer += "Nessuno" + "\n\n"
    except Exception as e:
        logger.info(e)
        text_answer ="Si è verificato un errore, per favore riprova!"

    return text_answer

###
# Start the auction
###
def start_asta(key,response):
    try:
        lista_buste_text = response['Item']['buste_asta']   # Get the list from the table 
        #logger.info(lista_buste_text)
        lista_buste = json.loads(lista_buste_text)  # make a python list from the json
        lista_buste['is_open'] = "True"
        for busta in lista_buste['buste']:                   # find the user and update the busta
            busta["svincolati"] = "None"
                
        dynamodbAPI.update_db_column(key,'buste_asta', lista_buste)
        text_answer = "Il mercato silenzioso è aperto e chiude alle 23:59!!\n\n"         
        text_answer +="Mandatemi un messaggio in PRIVATO a @FantaOnePiecebot"
    except Exception as e:
        logger.info(e)
        text_answer ="Si è verificato un errore, per favore riprova!"

    return text_answer

def status_asta(response):
    try:
        lista_buste_text = response['Item']['buste_asta']   # Get the list from the table 
        #logger.info(lista_buste_text)
        lista_buste = json.loads(lista_buste_text)  # make a python list from the json
        text_answer ="Elenco mancanti:\n"
        remaining = False
        for busta in lista_buste['buste']:                   # find the user and update the busta
            if (busta["svincolati"] == "None"):
                text_answer += "@"+busta["user"]+"\n"
                remaining = True
        if(remaining == False):
            text_answer ="Tutte le buste sono state consegnate!!\n"
            # text_answer +="Avete tempo fino alle 23.59 per cambiare idea"
            if(lista_buste['stage'] == "svincolo"):
                text_answer +="Avete tempo fino alle 23.59 per cambiare idea"
            else:
                text_answer += retrieve_asta_results(response)
    except Exception as e:
        logger.info(e)
        text_answer ="Si è verificato un errore, per favore riprova!"

    return text_answer
    
def asta_update(key,user_id,action,message,response):
    index = 0
    offset = 0
    # logger.info(stripped_msg)
    if(action == "release"):
        index = message.strip().find("svincolati:")
        offset = len("svincolati:")
    else:
        index = message.strip().find("offerte:")
        offset = len("offerte:")

    if (index < 0):
        text_answer ="Controlla ciò che hai scritto, bestia!\n\n"
        text_answer +="Prova in uno dei seguenti modi\n\n"
        text_answer +="@FantaOnePiecebot /asta_svincola\n"
        text_answer +="svincolati:\nPersonaggio1\n..\nPersonaggio n\n\n"
        text_answer +="oppure cosi\n\n"
        text_answer +="@FantaOnePiecebot /asta_offri\n"
        text_answer +="offerte:\nPersonaggio1\n..\nPersonaggio n\n"
        
    else:
        index += offset
        try:
            lista_buste_text = response['Item']['buste_asta']   # Get the list from the table 
            #logger.info(lista_buste_text)
            lista_buste = json.loads(lista_buste_text)  # make a python list from the json
            if(lista_buste['is_open'] == "True"):
                for busta in lista_buste['buste']:                   # find the user and update the busta
                    if(busta["user"] == user_id):
                        stripped_msg = message[index:].split()
                        offers_list = ""
                        for i in range(0, len(stripped_msg),2):
                            offers_list += stripped_msg[i].replace('\n','') + " "
                            offers_list += stripped_msg[i+1] + ","
                        busta["svincolati"] = offers_list[:-1]
                # logger.info(lista_buste)
                dynamodbAPI.update_db_column(key,'buste_asta', lista_buste)
                text_answer = "Perfetto la tua busta è stata memorizzata!"
            else:
                text_answer = "Non è possibile svincolare in questo momento!"
        except Exception as e:
            logger.info(e)
            text_answer ="Si è verificato un errore, per favore riprova!"
    return text_answer

def run_command(rcvd_message:telegramAPI.BotMessage):
    """Parse and run the command required by the user
        
        It takes in input a telegram bot message and returns the message to send
        back to the user.

        Parameters:
        rcvd_message : telegram bot message received from the client

        Returns:
        send_message : telegram bot message to send to the client
    """
    reply_message = telegramAPI.BotMessage(chat_id=rcvd_message.chat_id)

    # Comandi che NON richiedono l'autorizzazione e l'accesso ai dati
    if("/help" in rcvd_message.text): # Ritorna l'elenco dei comandi disponibili 
        reply_message.text = print_bot_command_list()
        return reply_message

    # Comandi che NON richiedono l'autorizzazione ma richiedono l'accesso ai dati
    db_response = dynamodbAPI.get_db_entry(rcvd_message.chat_id) # Read the table from the DB
    # logger.info(db_response)

    if("/formazione" in rcvd_message.text): # Ritorna la formazione del capitolo 
        reply_message.text = opgtAPI.retrieve_squads_from_app(opgtAPI.chapter_id[1])
        return reply_message
    if("/asta_svincola" in rcvd_message.text): # Salva nel database la busta del partecipante 
        reply_message.text = asta_update(rcvd_message.chat_id,rcvd_message.user_id,"release",rcvd_message.text,db_response)
        return reply_message
    if("/asta_offri" in rcvd_message.text): # Salva nel database la busta del partecipante 
        reply_message.text = asta_update(rcvd_message.chat_id,rcvd_message.user_id,"offer",rcvd_message.text,db_response)
        return reply_message
    # Comandi che richiedono l'autorizzazione e l'accesso ai dati
    if((rcvd_message.user_id == db_response['Item']['president_id']) or 
       (rcvd_message.user_id == db_response['Item']['vicepresident_id'])):
        if("/scarica_voti" in rcvd_message.text): 
            reply_message.text = opgtAPI.retrieve_rank_from_app(opgtAPI.chapter_id[1])
            return reply_message
        if("/asta_risultati" in rcvd_message.text): # Prendi il risultato delle buste 
            reply_message.text = retrieve_asta_results(rcvd_message.chat_id,db_response)
            return reply_message
        if("/asta_apri" in rcvd_message.text): # Apri l'asta
            reply_message.text = start_asta(rcvd_message.chat_id,db_response)
            return reply_message
        if("/asta_stato" in rcvd_message.text): # Apri l'asta
            reply_message.text = status_asta(db_response)
            return reply_message
    else:
        random.seed()
        reply_message.text = not_auth_answers[random.randint(0,len(not_auth_answers)-1)]
        return reply_message
    reply_message.text = "Mi dispiace non so come aiutarti"
    return reply_message
