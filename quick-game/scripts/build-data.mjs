import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import {fetchWindow} from './api.mjs';
import {applyReference,parseReference} from './reference-ratings.mjs';
import {buildDataset} from '../h5/model.mjs';
const root=process.env.GAME_DATA_ROOT?pathToFileURL(process.env.GAME_DATA_ROOT+'/'):new URL('../',import.meta.url);
const raw=JSON.parse(fs.readFileSync(new URL('data/snapshot.json',root)));
if(!raw.fetchWindow){const dir=new URL('data/raw/',root);raw.fetchWindow=fetchWindow(fs.readdirSync(dir).filter(f=>f.endsWith('.json')).map(f=>JSON.parse(fs.readFileSync(new URL(f,dir))).fetchedAt));raw.fetchedAt=raw.fetchWindow.from;fs.writeFileSync(new URL('data/snapshot.json',root),JSON.stringify(raw,null,2));}
const d=applyReference(buildDataset(raw),parseReference(fs.readFileSync(new URL('data/reference/ratings.txt',root),'utf8')));
fs.writeFileSync(new URL('data/reference/ratings.json',root),JSON.stringify(parseReference(fs.readFileSync(new URL('data/reference/ratings.txt',root),'utf8')),null,2));
fs.writeFileSync(new URL('data/reference/coverage.json',root),JSON.stringify(d.referenceReport,null,2));
fs.mkdirSync(new URL('h5/data/',root),{recursive:true});
fs.writeFileSync(new URL('h5/data/league.json',root),JSON.stringify(d));
fs.writeFileSync(new URL('h5/data/completeness.json',root),JSON.stringify(d.report,null,2));
console.log(JSON.stringify({teams:d.teams.length,players:d.players.length,complete:d.report.complete,failures:d.report.failures.length}));
