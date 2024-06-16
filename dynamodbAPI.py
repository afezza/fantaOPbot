"""
Dynamo DB python interface
"""
import json
import boto3 
import logging

# Database env init
dynamodb = boto3.resource("dynamodb")
db_table = dynamodb.Table("FantaOP")

logger = logging.getLogger()

# Public Functions
def get_db_entry(key:str): 
    """Retrieve information from the database

        Parameters:
        key : row key of the entry to retrieve

        Returns:
        db_response : data stored on the database
    """
    return db_table.get_item(Key={'edition_key':key})

def update_db_column(key:str,field_name, data): 
    """Updates the database
        
        It takes in input the key entry to update and the 

        Parameters:
        key : row key of the entry to update 
        field_name : column name to update in the db
        data : python object corresponding to the column data 
        to update in the db 

        Returns:
        send_message : telegram bot message to send to the client
    """
    response = db_table.update_item(
                    Key={'edition_key':key},
                    UpdateExpression="set #name = :n",
                    ExpressionAttributeNames={
                        "#name": field_name,
                    },
                    ExpressionAttributeValues={
                        ":n": str(json.dumps(data)),
                    },
                    ReturnValues="UPDATED_NEW",
                )
    logger.info(response)