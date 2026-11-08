@echo off
title Open Upload Folder for Netlify
echo Opening the folder containing "dist" for upload...
explorer.exe /select,"%~dp005 Software\frontend\dist"
