# Magic bytes

**Category:** Steganography  
**Difficulty:** Easy
**Points:** 100

## Description

TBD

## Challenge

A JPEG image with corrupted file header (magic bytes) that need to be restored to view the hidden flag.

## Files

- Base image: `base.jpg`
- Image with good header: `corrupted_good_header.jpg`
- Challenge file: `corrupted.jpg`

## Objective

Fix the file header to see the image.

## Solution

Fix the JPG file header:

- Change DE AD BE EF -> ff d8 ff e0

The flag is: `freshers{1M4G3_REURR3CT1ON}`

## Learning Objectives

- Understanding JPG file structure
- Learning about Magic Bytes and File Headers

## Author

Created by kennyH

---

