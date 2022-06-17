const { generateDependencyReport } = require('@discordjs/voice');

console.log(generateDependencyReport());

/*
--------------------------------------------------
Core Dependencies
- @discordjs/voice: 0.3.1
- prism-media: 1.2.9

Opus Libraries
- @discordjs/opus: 0.5.3
- opusscript: not found

Encryption Libraries
- sodium: 3.0.2
- libsodium-wrappers: not found
- tweetnacl: not found

FFmpeg
- version: 4.2.4-1ubuntu0.1
- libopus: yes
--------------------------------------------------
*/