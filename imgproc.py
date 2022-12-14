import cv2
import numpy as np
import os
import os.path as osp

LEGAL_EXTENSIONS = [
    '.png',
    '.jpg',
    '.jpeg'
]

SUFFIX_LQ = '_lq'
SUFFIX_THUMB = '_thumb'
SUFFIX_SQUARE = '_sq'
SUFFIX_THUMBSQUARE = '_thumbsq'

PROCESSING_SUFFIXES = [
    SUFFIX_LQ,
    SUFFIX_THUMB,
    SUFFIX_SQUARE,
    SUFFIX_THUMBSQUARE,
]

SPECIAL_SUFFIXES = PROCESSING_SUFFIXES + [
    '_sm',  # ignoring manual image optimizations
]

PROCESS_NEW_ONLY = True

MAX_SIZE_THUMB = 500
JPEG_QUAL_THUMB = 90
JPEG_QUAL_LQ = 65
JPEG_QUAL_SQ = 65

def getAllFiles(d, file_extensions=LEGAL_EXTENSIONS):
    files = [os.path.join(dp, f) for dp, dn, fn in os.walk(os.path.expanduser(d)) for f in fn]
    if file_extensions:
        files = [f for f in files if osp.splitext(f)[1] in file_extensions]
    return files

def addSuffix(f, s):
    d, e = osp.splitext(f)
    return ''.join((d+s, e))

def resizeAndPad(img, size, padColor=255):
    # https://stackoverflow.com/questions/44720580/resize-image-canvas-to-maintain-square-aspect-ratio-in-python-opencv

    h, w = img.shape[:2]
    sh, sw = size

    interp = cv2.INTER_CUBIC

    # aspect ratio of image
    aspect = w/h  # if on Python 2, you might need to cast as a float: float(w)/h

    # compute scaling and pad sizing
    if aspect > 1: # horizontal image
        new_w = sw
        new_h = np.round(new_w/aspect).astype(int)
        pad_vert = (sh-new_h)/2
        pad_top, pad_bot = np.floor(pad_vert).astype(int), np.ceil(pad_vert).astype(int)
        pad_left, pad_right = 0, 0
    elif aspect < 1: # vertical image
        new_h = sh
        new_w = np.round(new_h*aspect).astype(int)
        pad_horz = (sw-new_w)/2
        pad_left, pad_right = np.floor(pad_horz).astype(int), np.ceil(pad_horz).astype(int)
        pad_top, pad_bot = 0, 0
    else: # square image
        new_h, new_w = sh, sw
        pad_left, pad_right, pad_top, pad_bot = 0, 0, 0, 0

    # set pad color
    if len(img.shape) is 3 and not isinstance(padColor, (list, tuple, np.ndarray)): # color image but only one color provided
        padColor = [padColor]*3

    # scale and pad
    scaled_img = cv2.resize(img, (new_w, new_h), interpolation=interp)
    scaled_img = cv2.copyMakeBorder(scaled_img, pad_top, pad_bot, pad_left, pad_right, borderType=cv2.BORDER_CONSTANT, value=padColor)

    return scaled_img

af = getAllFiles('./img')
af = [f for f in af if not any(osp.splitext(f)[0].endswith(s) for s in SPECIAL_SUFFIXES)]

for i, f in enumerate(af):
    print(f'Processing file # {i+1}/{len(af)}: {f}')

    if PROCESS_NEW_ONLY and all(osp.isfile(addSuffix(f, s)) for s in PROCESSING_SUFFIXES):
        continue

    im = cv2.imread(f)
    w, h, c = im.shape
    m = max(w, h)
    s = MAX_SIZE_THUMB / m
    w_t, h_t = int(s * w), int(s * h)

    # Low Quality
    DIR_LQ = addSuffix(f, SUFFIX_LQ)
    if not osp.isfile(DIR_LQ) or not PROCESS_NEW_ONLY:
        cv2.imwrite(DIR_LQ, im, [int(cv2.IMWRITE_JPEG_QUALITY), JPEG_QUAL_LQ])

    # Thumbnail
    DIR_THUMB = addSuffix(f, SUFFIX_THUMB)
    if not osp.isfile(DIR_THUMB) or not PROCESS_NEW_ONLY:
        im_thumb = cv2.resize(im, (h_t, w_t))
        cv2.imwrite(DIR_THUMB, im_thumb, [int(cv2.IMWRITE_JPEG_QUALITY), JPEG_QUAL_THUMB])

    # Square
    DIR_SQ = addSuffix(f, SUFFIX_SQUARE)
    if not osp.isfile(DIR_SQ) or not PROCESS_NEW_ONLY:
        im_sq = resizeAndPad(im, (m, m))
        cv2.imwrite(DIR_SQ, im_sq, [int(cv2.IMWRITE_JPEG_QUALITY), JPEG_QUAL_SQ])

    # Square Thumbnail
    DIR_THUMBSQ = addSuffix(f, SUFFIX_THUMBSQUARE)
    if not osp.isfile(DIR_THUMBSQ) or not PROCESS_NEW_ONLY:
        im_thumbsq = resizeAndPad(im, (MAX_SIZE_THUMB, MAX_SIZE_THUMB))
        cv2.imwrite(DIR_THUMBSQ, im_thumbsq, [int(cv2.IMWRITE_JPEG_QUALITY), JPEG_QUAL_THUMB])
