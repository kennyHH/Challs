# I'm lost

**Category:** Steganography  
**Difficulty:** Easy
**Points:** 100

## Description

TBD

## Challenge

A JPEG image with replaced thumbnail. User had to extract the thumbnail to read the flag.

Few red herrings in the JPG to make it more interesting.

## Files

- Original_image: `roll_original.jpg`
- Thumbnail : `roll_thumb`
- Challenge file: `roll.jpg`

## Objective

Analyse the JPG file and extract the flag.

## Solution

Users can use different tools to do that , easiest way is to use exiftools:
`exiftool -b -ThumbnailImage challenge.jpg > thumb.jpg  `

The flag is: `freshers{th4nk_y0u_gr3gg5}`

## Learning Objectives

- Understanding JPG file structure

## Author

Created by kennyH

---

