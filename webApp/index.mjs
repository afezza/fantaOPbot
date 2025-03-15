import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { QueryCommand, DynamoDBDocumentClient, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { readFile } from 'fs/promises';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {

    console.log(event); 
    
    try {
        let body_text = '';

        if(event.rawPath === '/classification')
        {
            const htmlContent = await readFile(new URL('./classification/classification.html', import.meta.url), 'utf-8');
            let classification_body = await readFile(new URL('./classification/classification.js', import.meta.url), 'utf-8');

            if (event.rawQueryString !== '-1002194179581' && event.rawQueryString !== '-22222222222222')
            {
                event.rawQueryString = '-1002194179581';
            }
            // console.log("The user asked for classification for key" + event.rawQueryString);
            const command = new GetCommand({
                TableName: "FantaOP",
                Key: {
                    edition_key: event.rawQueryString,
                },
                });
            console.log("Classification Handling");

            const db_entry = await docClient.send(command);
            // console.log(db_entry); // TODO: is not working

            // Create a list for the matches and the teams from db entry
            let match_list = JSON.parse(db_entry['Item']['match_list']); 
            let team_list = JSON.parse(db_entry['Item']['teams']);

            let team_name_collection = {};
            for (let team in team_list) //returns the index
            {
                team_name_collection[team_list[team]['team_id']] =
                    {
                    x: team_list[team]['team_name'],
                    value : 0.0,
                    details : {}
                    }
            }

            for (let match in match_list)
            {
                if(match_list[match]['state'] != "COMPLETED") {break;}
            
                for (let team in match_list[match]['squads'])
                {   
                    team_name_collection[match_list[match]['squads'][team]['team_id']]['details'][match_list[match]['chapter']] = match_list[match]['squads'][team]['total_score']
                    team_name_collection[match_list[match]['squads'][team]['team_id']]['value'] += parseFloat(match_list[match]['squads'][team]['total_score'])
                }
            }
            // console.log(team_name_collection);

            let team_name_list = []
            for (let team in team_name_collection)
            {
                team_name_list.push(team_name_collection[team]);
            }
            team_name_list.sort((a, b) => parseFloat(b.value) - parseFloat(a.value));
            // console.log(team_name_list);
            let text_str = '';
            text_str += JSON.stringify(team_name_list);

            // Put the data in the js code to send to the client
            let script_query = "//script.js";
            let index_script = htmlContent.indexOf(script_query);
            let text_query = "//COLUMN_DATA";
            let index_data = classification_body.indexOf(text_query);
            
            body_text = htmlContent.slice(0, index_script);        
            body_text += classification_body.slice(0, index_data) + text_str + classification_body.slice(index_data+text_query.length) ;
            body_text += htmlContent.slice(index_script+script_query.length);        
        }
        else if(event.rawPath === '/rank_validation')
        {
            console.log("Rank validation handling");
            const command = new GetCommand({
                TableName: "FantaOP",
                Key: {
                    edition_key: '-1002194179581',
                },
                });

            const db_entry = await docClient.send(command);
            // console.log(db_entry); // TODO: is not working

            if(event.routeKey === 'GET /rank_validation')
            {
                const htmlContent = await readFile(new URL('./ranking_validation/rankingValidation.html', import.meta.url), 'utf-8');
                let classification_body = await readFile(new URL('./ranking_validation/rankingValidation.js', import.meta.url), 'utf-8');
                
                // Create a list for the matches and the teams from db entry
                let match_list = JSON.parse(db_entry['Item']['match_list']); 

                let text_str = '';
                text_str += JSON.stringify(match_list);
                // console.log(text_str);

                // Put the data in the js code to send to the client
                let script_query = "//script.js";
                let index_script = htmlContent.indexOf(script_query);
                let text_query = "//CHAPTER_DATA";
                let index_data = classification_body.indexOf(text_query);

                body_text = htmlContent.slice(0, index_script);        
                body_text += classification_body.slice(0, index_data) + text_str + classification_body.slice(index_data+text_query.length) ;
                body_text += htmlContent.slice(index_script+script_query.length);  
            }
            else if(event.routeKey === 'POST /rank_validation')
            {
                console.log("Saving the new ranking");
                let body = JSON.parse(event.body);

                let stored_token = db_entry['Item']['rank_validation_token'].replace(/"/g, ''); 
                console.log("stored_token" + stored_token);
                console.log("body.token" + body.token);
                if (body.token === stored_token) {
                    // save the stuff on the db
                    let updateCommand = new UpdateCommand({
                        TableName: "FantaOP",
                        Key: {edition_key: '-1002194179581',},
                        UpdateExpression:"set #name = :n",
                        ExpressionAttributeNames:{"#name": "match_list",},
                        ExpressionAttributeValues:{":n": body.jsonData,},
                        ReturnValues:"UPDATED_NEW",
                      });
                    let updateResponse = await docClient.send(updateCommand);
                    updateCommand = new UpdateCommand({
                        TableName: "FantaOP",
                        Key: {edition_key: '-1002194179581',},
                        UpdateExpression:"set #name = :n",
                        ExpressionAttributeNames:{"#name": 'rank_validation_token',},
                        ExpressionAttributeValues:{":n": "None",},
                        ReturnValues:"UPDATED_NEW",
                      });
                    updateResponse = await docClient.send(updateCommand);
                    body_text = JSON.stringify("Ranks validated and stored on the database");
                }
                else {
                    body_text = JSON.stringify("Token validation failed. Ask for a new one");
                }
                
                // console.log(JSON.stringify(body.jsonData));
            }
        }

        let response = {
            'statusCode': 200,
            'headers': {"Content-Type": "text/html",},
            'body': body_text
        }
        return response;
    } catch (error) {
        console.log("An exception has been caught " + error.message);
        return {
            statusCode: 500,
            body: `Error: ${error.message}`,
        };
    }
};
