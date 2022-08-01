#!/usr/bin/env python3
# -*- coding: utf-8 -*-

# PORT MAC RAIN

import pandas as pd

filenames = ['observatory-hill','parramatta','wollongong']
# filenames = ['observatory-hill']
# filename = 'lismore'

# filename = 'katoomba'

for filename in filenames:

	df = pd.read_csv(f'{filename}.csv')
	
	
	df['date'] = df.Year.map(str) + "-" + df.Month.map(str) + "-" + df.Day.map(str)
	
	df['short_date'] = df.Month.map(str) + "-" + df.Day.map(str)
	
	df['date'] = pd.to_datetime(df['date'], format="%Y-%m-%d")
	
	df['quarter'] = df['date'].dt.quarter
	
	df['fy'] = df['date'].dt.to_period('Q-JUN').dt.qyear.apply(lambda x: str(x-1) + "-" + str(x))
	df['season'] = df['date'].dt.month%12 // 3 + 1
	
	df2 = df[df['short_date'] != "2-29"].copy()
	
	# df2 = df
	df2['rainfall'] = df2['Rainfall amount (millimetres)']/df2['Period over which rainfall was measured (days)']
	df2['rainfall'] = df2['rainfall'].fillna(0)
	df2['rainfall_cum'] = df2.groupby(['fy'])['rainfall'].apply(lambda x: x.cumsum())
	
	df2 = df2.rename(columns={"Year": "year"})
	
	df2['year'] = pd.to_numeric(df2['year'])
	
	
	def makeShortDate(row):
		 if row['quarter'] == 1 or row['quarter'] == 2:
			 return "1901" + "-" + row['short_date']
		 else:
			 return "1900" + "-" + row['short_date']
	
	
	df2['short_date'] = df2.apply(makeShortDate, axis=1)
	
	df2['short_date'] = pd.to_datetime(df2['short_date'], format="%Y-%m-%d")
	
	df2 = df2[df2['year'] >= 1900]
	
	summer = df2[df2['season'] == 1]
	
	summer_totals = summer[['fy','rainfall']].groupby(['fy']).sum()
	
	short = df2[['rainfall_cum','date','short_date','year','fy']]

	totals = short[short['fy'] != '2021-2022'].groupby(['short_date']).median()
	
	totals = totals.rename(columns={'rainfall_cum': "Median"})
	
	totals['Very dry'] = short[short['fy'] != '2021-2022'].groupby(['short_date']).quantile(0.10)['rainfall_cum']
	
	totals['Very wet'] = short[short['fy'] != '2021-2022'].groupby(['short_date']).quantile(0.90)['rainfall_cum']
	
	current_rainfall = df2[df2['fy'] == '2021-2022'].copy().set_index('short_date')
	
	totals['2021-22 to date'] = current_rainfall['rainfall_cum']
	
	# totals = totals[:"1900-06-30"]
	
	totals = totals.reset_index()
	totals = totals.rename(columns={"short_date":"date"})
	totals[['date','Very dry','Very wet','Median','2021-22 to date']].to_csv(f'../cumulative-chart/assets/{filename}.csv', index=False)
	
	df3 = df2.copy()
	df3 = df3.drop(['date'], axis=1)
	
	df3 = df3.rename(columns={"short_date":"date"}) 
	df3[['year','date','rainfall']].to_csv(f'../charts/assets/{filename}.csv', index=False)

#%%

# import plotly.graph_objects as go

# fig = go.Figure()

# fig.add_trace(go.Scatter(x=totals['date'], y=totals['Q3'], name="90th percentile")) # fill down to xaxis
# fig.add_trace(go.Scatter(x=totals['date'], y=totals['median'], name="Median rainfall", fill='tonexty'))
# fig.add_trace(go.Scatter(x=totals['date'], y=totals['Q1'], name="10th percent", fill='tonexty'))
# fig.add_trace(go.Scatter(x=totals['date'], y=totals['Current'], name="2021 rainfall"))

# fig.update_layout(
# 	title="Cumulative rainfall for Port Macqurie"
# )

# fig.show()

# #%%

# # Richmond

# import pandas as pd

# filename = '212200'

# river = pd.read_csv(f'{filename}.csv')
# river.to_csv('test2.csv')
# river = river[2:]
# river.columns = river.iloc[0]

# river = river[1:]

# river = river.drop('Comments', axis=1)

# river['Date and time'] = pd.to_datetime(river['Date and time'], format="%H:%M:%S %d/%m/%Y")

# river['year'] = river['Date and time'].dt.strftime('%Y')

# river.to_csv('test2.csv')

# river['month-day'] = river['Date and time'].dt.strftime("%m-%d")

# river2 = river[river['month-day'] != "02-29"].copy()

# river2.to_csv('test.csv')

# river2['date'] = pd.to_datetime(river2['month-day'], format="%m-%d")
# river2[['date','year','Max']].to_csv('test.csv')
# river2['Max'] = river2['Max'].str.strip()
# river2['Min'] = river2['Min'].str.strip()
# river2['Mean'] = river2['Mean'].str.strip()

# river2 = river2[river2['year'] != "1988"]

# river2[['date','year','Max']].to_csv('charts/assets/north-richmond.csv', index=False)

# #%%

# # Penrith

# import pandas as pd

# filename = '212201'

# river = pd.read_csv(f'{filename}.csv')

# river = river[2:]
# river.columns = river.iloc[0]

# river = river[1:]

# river = river.drop('Comments', axis=1)

# river['Date and time'] = pd.to_datetime(river['Date and time'], format="%H:%M:%S %d/%m/%Y")

# river['year'] = river['Date and time'].dt.strftime('%Y')

# river['month-day'] = river['Date and time'].dt.strftime("%m-%d")

# river2 = river[river['month-day'] != "02-29"].copy()

# river2['date'] = pd.to_datetime(river2['month-day'], format="%m-%d")
# river2[['date','year','Max']].to_csv('test.csv')
# river2['Max'] = river2['Max'].str.strip()
# river2['Min'] = river2['Min'].str.strip()
# river2['Mean'] = river2['Mean'].str.strip()

# # river2 = river2[river2['year'] != "1988"]

# river2[['date','year','Max']].to_csv('charts/assets/penrith.csv', index=False)

# #%%
# # MAcleay at Kempsey

# import pandas as pd

# filename = '207004'

# river = pd.read_csv(f'{filename}.csv')

# river = river[2:]
# river.columns = river.iloc[0]

# river = river[1:]

# river = river.drop('Comments', axis=1)

# river['Date and time'] = pd.to_datetime(river['Date and time'], format="%H:%M:%S %d/%m/%Y")

# river['year'] = river['Date and time'].dt.strftime('%Y')

# river['month-day'] = river['Date and time'].dt.strftime("%m-%d")

# river2 = river[river['month-day'] != "02-29"].copy()

# river2['date'] = pd.to_datetime(river2['month-day'], format="%m-%d")
# # river2[['date','year','Max']].to_csv('test.csv')
# river2['Max'] = river2['Max'].str.strip()
# river2['Min'] = river2['Min'].str.strip()
# river2['Mean'] = river2['Mean'].str.strip()

# # river2 = river2[river2['year'] != "1988"]

# river2[['date','year','Max']].to_csv('charts/assets/pm-river.csv', index=False)



# #%%


# #%%

# # pvt = df2.pivot(index='date',columns='year', values='rainfall').reset_index()

# # pvt.to_csv('years-rainfall.csv', index=False)


# # df2 = df[['month-day','rainfall']].groupby('month-day').quantile(0.25)

# # df3 = df[['month','year','rainfall']].groupby(['month','year']).sum()