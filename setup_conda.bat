@echo off
echo Creating conda environment...
call E:\Miniconda3\Scripts\activate.bat
call conda create -n web-agent python=3.11 -c conda-forge --override-channels -y
call conda activate web-agent
echo Installing packages...
pip install playwright openai beautifulsoup4 lxml python-dotenv jinja2
echo Installing Playwright browsers...
playwright install chromium
echo Setup complete!
echo.
echo To activate the environment, run:
echo   conda activate web-agent