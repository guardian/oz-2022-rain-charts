#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import pandas as pd

df = pd.read_csv('LGA to LGA 5 years.csv')

excludes = [
No usual address (NSW)
Migratory - Offshore - Shipping (NSW)
No usual address (Vic.)
Migratory - Offshore - Shipping (Vic.)
No usual address (Qld)
Migratory - Offshore - Shipping (Qld)
No usual address (SA)
Migratory - Offshore - Shipping (SA)
No usual address (WA)
Migratory - Offshore - Shipping (WA)
No usual address (Tas.)
Migratory - Offshore - Shipping (Tas.)
No usual address (NT)
Migratory - Offshore - Shipping (NT)
No usual address (ACT)
Migratory - Offshore - Shipping (ACT)
Unincorp. Other Territories
No usual address (OT)
Migratory - Offshore - Shipping (OT)]