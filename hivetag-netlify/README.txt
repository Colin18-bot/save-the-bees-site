# 🐝 HiveTag – NFC Beehive Inspection System

[![Netlify Status](https://api.netlify.com/api/v1/badges/a440782f-8fbf-4bad-8a24-2f29b6ba4047/deploy-status)](https://app.netlify.com/projects/beekeeper-guide/deploys)

**Live Site:** 🌐 [www.beezknees.co.uk](https://www.beezknees.co.uk)

---

## 📦 Overview

HiveTag is a custom-built NFC-enabled beekeeping system designed to simplify hive inspections using a tap-and-log method. Built with vanilla JavaScript, Supabase, Google Forms, Google Sheets, and Netlify Functions, this project allows beekeepers to:

- Register hives and locations
- Inspect hives using dynamic NFC tap links
- Auto-fill inspection data including GPS and weather
- Manage logins, registrations, and account deletion securely

---

## 🚀 Features

- 🔐 User authentication with Supabase
- 📍 GPS-powered hive recognition
- 🌦️ Live weather data via WeatherAPI
- 🧠 Dynamic prefill links for inspection forms
- 🗂️ Fully automated backend via Make.com and serverless functions
- 📩 Email & PDF reports of inspections
- 🧽 Account deletion and secure session handling

---

## 🧪 Technologies

- HTML / CSS / JS (Vanilla)
- Supabase (auth & database)
- Google Forms + Sheets
- Make.com (Automations)
- Netlify + Netlify Functions (Backend)
- OpenCageData (Reverse Geolocation)
- WeatherAPI (Live Weather)
- GitHub + GitHub Desktop

---

## 🛠️ Setup & Development

### 1. Clone the Repo
```bash
git clone https://github.com/YOUR-USERNAME/hivetag-netlify.git
cd hivetag-netlify
