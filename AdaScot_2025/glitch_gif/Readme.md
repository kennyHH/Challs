# Glitch in the Matrix

**Category:** Steganography  
**Difficulty:** Easy/Medium  
**Points:** 100

## Description

This GIF gave me a headache, but at least one frame made it worth it.

## Challenge

You're given a glitched GIF file that appears to be heavily distorted. Your task is to find the hidden flag somewhere within this digital mess.

## Files

- `glitch.gif` or `glitch_2.gif`

Animation in `glitch.gif` is faster. 
Both contain a flag. 
Pick only one for the challenge. 

The flag is hidden in 
- frame18 - `glitch.gif` 
- frame52-54 - `glitch2.gif`

## Objective

Find the flag hidden within the GIF file.

## Solution

The flag is hidden in one of the frames of the GIF animation. To solve this challenge:

1. **Extract individual frames** from the GIF using tools like:
   - `ffmpeg -i glitch.gif frame_%d.png`
   - Online GIF frame extractors
   - Image editing software (GIMP, Photoshop, etc.)
   - Python with PIL: `Image.open('glitch.gif')`


The flag is: `enusec{y0u_g0t_gl1tch3d}`

## Hint
*Hint: Not all frames are created equal... 👀*

## Learning Objectives

- Understanding GIF file structure
- Frame-by-frame analysis techniques

## Author

Created by kennyH

---

