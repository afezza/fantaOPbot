import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { QueryCommand, DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
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
        else if(event.rawPath === '/rank_verification')
        {
            if(event.routeKey === 'GET /rank_verification')
            {
                console.log("The user asked for rank verification page");
            }
            else if(event.routeKey === 'POST /rank_verification')
            {
                console.log("The user asked for rank verification save");
                let body = JSON.parse(event.body);
                console.log(body.token);
                console.log(JSON.stringify(body.jsonData));
                body_text = "ok"
            }
        }

        let response = {
            'statusCode': 200,
            'headers': {"Content-Type": "text/html",},
            'body': body_text
        }
        return response;
    } catch (error) {
        return {
            statusCode: 500,
            body: `Error: ${error.message}`,
        };
    }
};
