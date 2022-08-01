#!/usr/bin/env python3
# -*- coding: utf-8 -*-

# BOM WATER FORMAT

import pandas as pd

filename = 'mary-river'

river = pd.read_csv(f'{filename}.csv')

river = river[2:]
river = river[:-2]

river.columns = river.iloc[0]

river = river[1:]

river = river.drop('Comments', axis=1)

# river = river.dropna(subset=['Mean'])

river['Date and time'] = pd.to_datetime(river['Date and time'], format="%H:%M:%S %d/%m/%Y")

river['year'] = river['Date and time'].dt.strftime('%Y')

river['month-day'] = river['Date and time'].dt.strftime("%m-%d")

river2 = river[river['month-day'] != "02-29"].copy()

river2['date'] = pd.to_datetime(river2['month-day'], format="%m-%d")

river2['Max'] = river2['Max'].str.strip()
river2['Max'] = river2['Max'].fillna("")

river2[['date','year','Max']].to_csv(f'../charts/assets/{filename}.csv', index=False)