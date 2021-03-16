var VIMEO_COUNTER = 0;
var CONTENT = {
    vimeo_count: function () {
        return VIMEO_COUNTER++;
    },
    contents: [
        {
            tags: ['frankie_eder', 'art'],
            rows: [
                {title: "FILM REEL"},
                {subsubtitle: "cw: flashing lights"},
                {
                    type_vimeo: true,
                    vimeo: '209132295',
                    aspect_ratio: '41.43%',
                },
            ],
        }, {
            tags: ['frankie_eder', 'art'],
            rows: [
                {title: "CAMERA OBSCURA"},
                {subtitle: "narrative featurette film"},
                {
                    thumbnail: true,
                    type_photo_scrollbox: true,
                    scrollcontent: [
                        {vimeo: "466791628", loopstart: 737, loopend: 5000},
                        {vimeo: "466791628", loopstart: 707, loopend: 5000},
                    ],
                },
            ],
        }, {
            tags: ['frankie_eder', 'art'],
            rows: [
                {title: "Crow's Landing I"},
                {subtitle: "2020-08-13"},
                {
                    type_photo_scrollbox: true,
                    scrollcontent: [
                        {img: "67/DSC00378", ext: "jpeg"},
                        {img: "67/DSC00384", ext: "jpeg"},
                    ],
                },
            ],
        }, {
            tags: ['frankie_eder'],
            rows: [
                {title: "Crow's Landing I"},
                {subtitle: "2020-08-13"},
                {
                    type_photo_scrollbox: true,
                    scrollcontent: [
                        {img: "67/DSC00378", ext: "jpeg"},
                        {img: "67/DSC00384", ext: "jpeg"},
                        {img: "67/DSC00378", ext: "jpeg"},
                    ],
                },
            ],
        }, {
            tags: ['frankie_eder', 'art', 'film'],
            rows: [
                {title: "Crow's Landing I"},
                {subtitle: "2020-08-13"},
                {
                    type_photo_scrollbox: true,
                    scrollcontent: [
                        {img: "67/DSC00378", ext: "jpeg"},
                        {img: "67/DSC00384", ext: "jpeg"},
                        {img: "67/DSC00378", ext: "jpeg"},
                        {img: "67/DSC00384", ext: "jpeg"},
                    ],
                },
            ],
        },
    ]

}