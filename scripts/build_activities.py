#!/usr/bin/env python3
"""Rebuild data/activities.json from data/activities.csv."""
import pandas as pd, json, os
here=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
df=pd.read_csv(os.path.join(here,'data','activities.csv'))
df['date']=pd.to_datetime(df['date'])
df=df.drop_duplicates(subset=['date','dist_m','mov_s']).sort_values('date').reset_index(drop=True)
df['km']=(df['dist_m']/1000).round(2); df['mi']=(df['km']*0.621371).round(2)
df['week']=df['date'].dt.to_period('W').dt.start_time
wk=df.groupby('week').agg(km=('km','sum'),mi=('mi','sum'),load=('load','sum'),n=('km','count')).reset_index()
wk['week']=wk['week'].dt.strftime('%Y-%m-%d'); wk['mi']=wk['mi'].round(1); wk['km']=wk['km'].round(1)
acts=[{'date':r['date'].strftime('%Y-%m-%d'),'km':r['km'],'mi':r['mi'],'sec':int(r['mov_s']),
       'hr':None if pd.isna(r['hr']) else int(r['hr']),
       'intensity':None if pd.isna(r['intensity']) else round(float(r['intensity']),1),
       'load':None if pd.isna(r['load']) else int(r['load']),'name':r['name']} for _,r in df.iterrows()]
json.dump({'activities':acts,'weekly':wk.to_dict(orient='records')},
          open(os.path.join(here,'data','activities.json'),'w'),indent=0)
print(f"wrote {len(acts)} activities + {len(wk)} weeks")
