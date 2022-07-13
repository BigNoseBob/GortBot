# GortBot

Gort is a music-playing discord bot which streams music to you through a combination of **ffmpeg** and **YouTube Data API v3**. 
Videos are queried using youtube, and ffmpeg pipes the audio into a readable stream for listening. Gort is **my personal project**, 
and as such is expected to contain a certain degree of bugs and unsightly code. This project has recently been made public. Feel 
free to **fork** the project and add your own features to Gort - I'd be happy to take a look as well.

**NOTE**: Gort does require quite an extensive `.env` file. You'll need to create one in the home directory with the following variables
and fill in their respective values.
```
# .env

# Discord-related
DISCORD_TOKEN = token                             # Your bot's secret token
clientID = client id                              # Your bot's client ID
guildID = guild id                                # For testing purposes

# YouTube Data API
youtube_api_key = API key                         # API key from Youtube Data API v3

# Spotify API
spotify_client_id = spotify client id             # client ID
spotify_client_secret = spotify client secret     # client secret
```

You can find more information about Gort and its production on my [website](https://oliverr.dev/gort.html).
