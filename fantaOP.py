"""
Fanta One Piece bot library
"""
import json
import boto3 
import random

import opgtAPI

# Database env init
dynamodb = boto3.resource("dynamodb")
db_table = dynamodb.Table("FantaOP")

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
def retrieve_asta_results(response):
    try:
        lista_buste_text = response['Item']['buste_asta']   # Get the list from the table 
        #print(lista_buste_text)
        lista_buste = json.loads(lista_buste_text)  # make a python list from the json
        lista_buste['is_open'] = "False"
        update_db_column('buste_asta', lista_buste)
        text_answer = "<b>Risultati:</b>\n"
        for busta in lista_buste['buste']:                   # find the user and update the busta
            text_answer += "<u>"+busta["user"]+":</u>\n"
            if (busta["svincolati"] != "None"):
                text_answer += busta["svincolati"].replace(",","\n") + "\n\n"
            else:
                text_answer += "Nessuno" + "\n\n"
    except Exception as e:
        print(e)
        text_answer ="Si è verificato un errore, per favore riprova!"

    return text_answer

###
# Start the auction
###
def start_asta(response):
    try:
        lista_buste_text = response['Item']['buste_asta']   # Get the list from the table 
        #print(lista_buste_text)
        lista_buste = json.loads(lista_buste_text)  # make a python list from the json
        lista_buste['is_open'] = "True"
        for busta in lista_buste['buste']:                   # find the user and update the busta
            busta["svincolati"] = "None"
                
        update_db_column('buste_asta', lista_buste)
        text_answer = "Il mercato silenzioso è aperto e chiude alle 23:59!!\n\n"         
        text_answer +="Mandatemi un messaggio in PRIVATO a @FantaOnePiecebot"
    except Exception as e:
        print(e)
        text_answer ="Si è verificato un errore, per favore riprova!"

    return text_answer

def status_asta(response):
    try:
        lista_buste_text = response['Item']['buste_asta']   # Get the list from the table 
        #print(lista_buste_text)
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
        print(e)
        text_answer ="Si è verificato un errore, per favore riprova!"

    return text_answer
    
def asta_update(user_id,action,message,response):
    index = 0
    offset = 0
    # print(stripped_msg)
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
            #print(lista_buste_text)
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
                # print(lista_buste)
                update_db_column('buste_asta',lista_buste)
                text_answer = "Perfetto la tua busta è stata memorizzata!"
            else:
                text_answer = "Non è possibile svincolare in questo momento!"
        except Exception as e:
            print(e)
            text_answer ="Si è verificato un errore, per favore riprova!"
    return text_answer

def exec_command(message,user_id):
    global chat_id
    # Comandi che NON richiedono l'autorizzazione e l'accesso ai dati
    if("/help" in message): # Ritorna l'elenco dei comandi disponibili 
        bot_reply = print_bot_command_list()
        return bot_reply

    # Comandi che NON richiedono l'autorizzazione ma richiedono l'accesso ai dati
    db_response = db_table.get_item(Key={'edition_key':'-1002100931875'}) # Read the table from the DB
    if("/formazione" in message): # Ritorna la formazione del capitolo 
        bot_reply = opgtAPI.retrieve_squads_from_app(opgtAPI.chapter_id[1])
        return bot_reply
    if("/asta_svincola" in message): # Salva nel database la busta del partecipante 
        bot_reply = asta_update(user_id,"release",message,db_response)
        return bot_reply
    if("/asta_offri" in message): # Salva nel database la busta del partecipante 
        bot_reply = asta_update(user_id,"offer",message,db_response)
        return bot_reply
    # Comandi che richiedono l'autorizzazione e l'accesso ai dati
    if((user_id == db_response['Item']['president_id']) or (user_id == db_response['Item']['vicepresident_id'])):
        # chat_id = "-1002194179581"
        if("/asta_risultati" in message): # Prendi il risultato delle buste 
            bot_reply = retrieve_asta_results(db_response)
            return bot_reply
        if("/asta_apri" in message): # Apri l'asta
            bot_reply = start_asta(db_response)
            return bot_reply
        if("/asta_stato" in message): # Apri l'asta
            bot_reply = status_asta(db_response)
            return bot_reply
    else:
        random.seed()
        bot_reply = not_auth_answers[random.randint(0,len(not_auth_answers)-1)]
        return bot_reply
    return "Mi dispiace non so come aiutarti"

# Private Functions 
"""
Function to update the database column
# field_name is the column name
# data is the json containing the data to update
"""
def update_db_column(field_name, data): 
    response = db_table.update_item(
                    Key={'edition_key':'-1002100931875'},
                    UpdateExpression="set #name = :n",
                    ExpressionAttributeNames={
                        "#name": field_name,
                    },
                    ExpressionAttributeValues={
                        ":n": str(json.dumps(data)),
                    },
                    ReturnValues="UPDATED_NEW",
                )
