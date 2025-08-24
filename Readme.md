# Enusec Challenges

A collection of cybersecurity challenges for learning and practice.

## Challenge List

| Name | Category | Difficulty | Description | Status |
|------|----------|------------|-------------|--------|
|Glitch in the matrix      |Forensics          |Easy/Medium            |A corrupted GIF file that requires frame-by-frame analysis to locate a hidden flag within the individual frames.              |   🟢     |
|Magic bytes     |Forensics          |Easy            |A JPEG image with corrupted file header magic bytes that need to be restored to view the hidden flag.           |  🔴      |
|I'm lost      |Forensics          |Easy            |A JPEG file where the embedded thumbnail has been replaced with flag image.             |   🔴     |
|Hiding on the bottom      |Forensics          |Easy            |A JPEG image with modified height dimensions that hide the bottom portion containing the flag. Requires hex editing to restore proper dimensions.            |   🔴     |
|Weird traffic      |Forensics          |Medium            |Network traffic capture containing encrypted DNS tunneling communication using dnscat2. Analyze and decrypt the C2 channel to extract the flag.             |   🔴     |
| Hidden melody     |Forensics          |Easy/Medium            |An audio file containing morse code signals embedded within the music that must be decoded to reveal the flag.             |     🔴   |
|Message from space      |Forensics                    |Easy/Medium            |An audio file containing SSTV signals that decode to reveal an image with the hidden flag.             |    🔴    |
| A bombastic zip     |Misc          |Easy/Medium            |A zip bomb consisting of nested archives with 300 layers deep. Read password -> extract zip -> repeat.             |    🔴    |
|Jump      |Misc                    |Medium            |A Unity 2D platformer game where players must reverse engineer or modify game mechanics to achieve an impossible jump and capture the flag.        |    🔴    |

## Status Legend

- 🟢 Complete
- 🟡 In Progress  
- 🔴 Not Started
- ✅ Released