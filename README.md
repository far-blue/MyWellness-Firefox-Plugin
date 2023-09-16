# MyWellness-Firefox-Plugin
A firefox plugin to export activities from MyWellness as TCX files

The Technogym MyWellness app and website can show your activities if you make use of Technogym equipment while logged in. However, the MyWellness system is very much a walled garden and very little activity data can be exported. There is basic support for export to Strava and Training Peaks but I found the quality of the data to be poor and very hit-and-miss.

However, the MyWellness website does show power, cadence and HR graphs for cardio activities on most equipment (I've not had any success with group cycle or skillmill). This plugin interprets, interpolates and generally attempts to massage this data into a standard TCX file which, while not perfect, is at least then usable with the wider fitness ecosystems such as polar, garmin, suunto, strava, etc.

## Using the plugin

This is a developer plugin for Firefox. Maybe one day it might be on the Firefox plugin 'store' but for now you will need to clone this repo then install it manually as a "Temporary Add-On". You can do this by navigating to `about:debugging#/runtime/this-firefox` in firefox, selecting 'Load Temporary Add-On' and selecting the directory you have cloned this repo to.

To use the plugin, once installed, log into your MyWellness account, select an activity set and select a cardio activity. Between the normal "< Back" and "Next >" buttons in the header of the actvity page a new "Export" button should appear. Clicking this button will first ask you when you did the activity (because MyWellness doesn't track this per activity, only per set). Enter a time and then click "Download" and the TCX file will be generated and you will be asked where you would like to save it. Feel free to name it whatever you wish and save it wherever you like.

## How stable is the plugin

I wrote it in a few hours and I've only been able to test it with the equipment available at my gym so, as they say, your mileage may vary - quite literally in this case. I'd be happy to hear feedback although I have very little time available to work further on the plugin so further enhancements will likely be driven by my desire to fix things for my own data.

## Can I make changes or enhancements?

This plugin is MIT licensed so you are absolutely free to fork it and do whatever you want with it :) If you wish to submit a PR then please do and I will attempt to review and merge improvements where I can :)
