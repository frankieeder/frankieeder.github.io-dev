var VIMEO_COUNTER = 0;
var CONTENT = {
    vimeo_count: function () {
        return VIMEO_COUNTER++;
    },
    contents: [
        {
            tags: ['film', 'directed_by', 'shot_by', 'edited_by', 'colored_by', 'portfolio'],
            rows: [
                {title: "FILM REEL"},
                {subsubtitle: "cw: flashing lights"},
                {
                    type_vimeo: true,
                    vimeo: '209132295',
                    aspect_ratio: '41.43%',
                },
            ],
        },
        {
            tags: ['portfolio', 'frankie_eder'],
            rows: [
                {title: "CAMERA OBSCURA"},
                {subtitle: "(narrative featurette film)"},
                {
                    type_vimeo: true,
                    vimeo: '486248111',
                    aspect_ratio: '100%',
                },
                {credits: 'Director of Photography, Score, Sound Design'},
            ],
        },
        {
            tags: ['portfolio', 'frankie_eder'], // TODO: More???
            rows: [
                {title: "MUTUAL TRANSGRESSION VI - ATHAZAGORA"},
                {subtitle: "(a skateboard film series focusing on quality over quantity)"},
                {subsubtitle: "cw: flashing lights"},
                {
                    type_vimeo: true,
                    vimeo: '408120845',
                    aspect_ratio: '82.85%',
                },
                {credits: 'Director, Director of Photography, Editor, Colorist'},
            ],
        },
        {
            tags: ['still', 'manipulated'],
            rows: [
                {title: "Moonset I"},
                {
                    type_image: true,
                    img: 'visual/DSC01344_HaarD13', // TODO: Should all of these be moved?
                    ext: 'jpg',
                },
            ],
        },
        {
            tags: ['still', 'manipulated'],
            rows: [
                {title: "why; are you paying for this?"},
                {subtitle: "(three-channel video installation)"},
                {subsubtitle: "cw: sexual violence, flashing lights"},
                {
                    // TODO: Fix scrollbox height?
                    type_photo_scrollbox: true,
                    scrollcontent: [
                        {img: "why/sw5_cylindrical", ext: "png"},
                        {img: "why/cmbyn", ext: "png"},
                        {img: "why/br", ext: "png"},
                    ],
                },
                {subheader: "360 Degree Installation View"},
                {
                    type_vimeo: true,
                    vimeo: '384236279',
                },
                {
                    html: `<h6>Isolating and algorithmically affecting scenes from cinema that romanticize sexual manipulation, "why; are you paying for this?" offers alternate, synchronized views that question physical and emotional autonomy of survivors in the digital age of Hollywood.<br><br>
                        Channel 1 (left): Unmodified, theatrical excerpts<br>
                        Channel 2 (middle): Heavily modified excerpt that cycles at a high human heart rate.<br>
                        Channel 3 (right): Degraded view of theatrical excerpts, physically opposing Channel 1.
                    </h6>`
                }
            ],
        },
        {
            tags: ['portfolio', 'frankie_eder'], // TODO: More???
            rows: [
                {title: "AMPHOS"},
                {subtitle: "(an expirimental short film)"},
                {subsubtitle: "cw: flashing lights"},
                {
                    type_vimeo: true,
                    vimeo: '307996559',
                },
                {credits: 'Director, Director of Photography, Editor, Colorist'},
                {html: "<h5>Awards: <i>Best Editing</i>, Grizzly Film Festival 2018</h5>"}
            ],
        },
        {
            tags: ['frankie_eder', 'art', 'still', 'photography', 'landscape'],
            rows: [
                {title: "Crow's Landing II"},
                {subsubtitle: "2020-08-13"},
                {
                    type_photo_scrollbox: true,
                    scrollcontent: [
                        {img: "67/DSC00378", ext: "jpeg"},
                        {img: "67/DSC00384", ext: "jpeg"},
                        {img: "67/DSC00398", ext: "jpeg"},
                        {img: "67/DSC00476", ext: "jpeg"},
                        {img: "67/DSC00369", ext: "jpeg"},
                        {img: "67/DSC00417", ext: "jpeg"},
                        {img: "67/DSC00459", ext: "jpeg"},
                        {img: "67/DSC00469", ext: "jpeg"},
                    ],
                },
            ],
        },
        {
            tags: ['art', 'still', 'photography', 'landscape'],
            rows: [
                {title: "Crow's Landing I"},
                {subsubtitle: "2020-08-13"},
                {
                    type_photo_scrollbox: true,
                    scrollcontent: [
                        {img: "66/DSC00267", ext: "jpeg"},
                        {img: "66/DSC00304", ext: "jpeg"},
                        {img: "66/DSC00306", ext: "jpeg"},
                        {img: "66/DSC00361", ext: "jpeg"},
                    ],
                },
            ],
        },
        {
            tags: ['art', 'still', 'photography', 'landscape'],
            rows: [
                {title: "Clairemont Hills"},
                {subsubtitle: "2020-08-11"},
                {
                    type_photo_scrollbox: true,
                    scrollcontent: [
                        {img: "68/DSC00171", ext: "jpeg"},
                    ],
                },
            ],
        },
        {
            tags: ['art', 'still', 'photography', 'landscape'],
            rows: [
                {title: "Pacific Coast II"},
                {subtitle: "Martinez, CA"},
                {subsubtitle: "2020-12-19"},
                {
                    type_photo_scrollbox: true,
                    dir_prefix: "65/",
                    scrollcontent: [
                        {img: "DSC01738", ext: "jpeg"},
                        {img: "DSC01667", ext: "jpeg"},
                        {img: "DSC01677", ext: "jpeg"},
                        {img: "DSC01694", ext: "jpeg"},
                        {img: "DSC01709", ext: "jpeg"},
                        {img: "DSC01716", ext: "jpeg"},
                        {img: "DSC01731", ext: "jpeg"},
                    ],
                },
            ],
        },


//        {
//            tags: ['frankie_eder', 'art'],
//            rows: [
//                {title: "CAMERA OBSCURA"},
//                {subtitle: "narrative featurette film"},
//                {
//                    thumbnail: true,
//                    type_photo_scrollbox: true,
//                    scrollcontent: [
//                        {vimeo: "307996559", loopstart: 737, loopend: 5000},
//                        {vimeo: "307996559", loopstart: 707, loopend: 5000},
//                        {vimeo: "307996559", loopstart: 744, loopend: 10000},
//                        {vimeo: "307996559", loopstart: 39, loopend: 7000},
//                        // {vimeo: "466791628", loopstart: 836.5, loopend: 3000},
//                        // {vimeo: "466791628", loopstart: 394, loopend: 46000},
//                        // {vimeo: "466791628", loopstart: 569.5, loopend: 12000},
//                        // {vimeo: "466791628", loopstart: 121, loopend: 5500},
//                        // {vimeo: "466791628", loopstart: 969, loopend: 27000},
//                    ],
//                },
//            ],
//        },
        {
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