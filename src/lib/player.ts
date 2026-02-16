import {v4 as uuidv4} from 'uuid';

const KEY = 'doodleDashPlayerId';
const NAME_KEY = "doodledash_player_name";
export function getPlayerId():string{
    let id = localStorage.getItem(KEY);

    if(!id){
        id = uuidv4();
        localStorage.setItem(KEY,id);
    }
    return id;
}




export function getPlayerName(): string {
  return localStorage.getItem(NAME_KEY) || "";
}

export function setPlayerName(name: string) {
  localStorage.setItem(NAME_KEY, name);
}