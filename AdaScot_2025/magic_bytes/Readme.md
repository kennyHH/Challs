# Magic bytes

**Category:** Steganography  
**Difficulty:** Easy
**Points:** 100

## Description

My friend just sent me this really important photo from our trip last summer, but something's wrong with it. Every time I try to open it, my image viewer just gives me an error saying the file is corrupted or in an unsupported format.

I know the photo was taken with a regular camera and should be a standard image file, but I'm starting to think something happened during the transfer. 

Can you help me figure out what's wrong and recover this precious memory?

## Challenge

A JPEG image with corrupted file header (magic bytes) that need to be restored to view the hidden flag.

## Files

- Image with good header: `shop_good.jpg`
- Challenge file: `shop.jpg`

## Objective

Fix the file header to see the image.

## Solution

Fix the JPG file header:

- Change DE AD BE EF -> ff d8 ff e0

The flag is: `enusec{1M4G3_RESURR3CT1ON}`

## Learning Objectives

- Understanding JPG file structure
- Learning about Magic Bytes and File Headers

## Author

Created by kennyH

---

