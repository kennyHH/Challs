# Glitch in the Matrix

**Category:** Steganography  
**Difficulty:** Easy/Medium  
**Points:** 100

## Description

This GIF gave me a headache, but at least one frame made it worth it.

## Challenge

You're given a glitched GIF file that appears to be heavily distorted. Your task is to find the hidden flag somewhere within this digital mess.

## Files

- `final_glitch2.gif` - The glitched animation file

## Objective

Find the flag hidden within the GIF file.

## Solution

The flag is hidden in one of the frames of the GIF animation. To solve this challenge:

1. **Extract individual frames** from the GIF using tools like:
   - `ffmpeg -i glitch.gif frame_%d.png`
   - Online GIF frame extractors
   - Image editing software (GIMP, Photoshop, etc.)
   - Python with PIL: `Image.open('glitch.gif')`

2. **Examine each frame** carefully - most will be glitched/corrupted, but one frame should contain the readable flag.

The flag format is: `CTF{...}`



## Learning Objectives

- Understanding GIF file structure
- Frame-by-frame analysis techniques  
- Using multimedia forensics tools

## Author

Created by kennyH

---

*Hint: Not all frames are created equal... 👀*