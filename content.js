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
                    dir_prefix: '67/',
                    scrollcontent: [
                        {img: "DSC00378"},
                        {img: "DSC00384"},
                        {img: "DSC00398"},
                        {img: "DSC00476"},
                        {img: "DSC00369"},
                        {img: "DSC00417"},
                        {img: "DSC00459"},
                        {img: "DSC00469"},
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
                    dir_prefix: '66/',
                    scrollcontent: [
                        {img: "DSC00267"},
                        {img: "DSC00304"},
                        {img: "DSC00306"},
                        {img: "DSC00361"},
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
                        {img: "68/DSC00171"},
                    ],
                },
            ],
        },
        {
            tags: ['frankie_eder', 'art', 'still', 'photography', 'landscape'],
            rows: [
                {title: "Pacific Coast II"},
                {subtitle: "Martinez, CA"},
                {subsubtitle: "2020-12-19"},
                {
                    type_photo_scrollbox: true,
                    dir_prefix: "65/",
                    scrollcontent: [
                        {img: "DSC01738"},
                        {img: "DSC01667"},
                        {img: "DSC01677"},
                        {img: "DSC01694"},
                        {img: "DSC01709"},
                        {img: "DSC01716"},
                        {img: "DSC01731"},
                    ],
                },
            ],
        },
        {
            tags: ['frankie_eder', 'art', 'still', 'photography', 'landscape'],
            rows: [
                {title: "Pacific Coast I"},
                {subtitle: "Stinson Beach, CA"},
                {subsubtitle: "2020-12-13"},
                {
                    type_photo_scrollbox: true,
                    dir_prefix: "64/",
                    scrollcontent: [
                        {img: "DSC00452"},
                        {img: "DSC00457"},
                        {img: "DSC00469"},
                        {img: "DSC00478"},
                        {img: "DSC00480"},
                    ],
                },
            ],
        },
        {
            // TODO: Add Architecture tag
            // TODO: Add landscape tag
            tags: ['frankie_eder', 'art', 'still', 'photography', 'landscape', 'architecture'],
            rows: [
                {title: "Movie Theater I"},
                {subtitle: "Dublin, CA"},
                {subsubtitle: "2020-11-22"},
                {
                    type_photo_scrollbox: true,
                    dir_prefix: "63/",
                    scrollcontent: [
                        {img: "DSC01619"},
                        {img: "DSC01628"},
                        {img: "DSC01613"},
                        {img: "DSC01623"},
                        {img: "DSC01616"},
                        {img: "DSC01621"},
                        {img: "DSC01625"},
                        {img: "DSC01635"},
                        {img: "DSC01630"},
                        {img: "DSC01640"},
                        {img: "DSC01646"},
                        {img: "DSC01611"},
                        {img: "DSC01643"},
                        {img: "DSC01608"},
                    ],
                },
            ],
        },
        {
            tags: ['art', 'still', 'photography', 'landscape'],
            rows: [
                {title: "Patterson Pass"},
                {subtitle: "Tracy, CA"},
                {subsubtitle: "2020-11-22"},
                {
                    type_photo_scrollbox: true,
                    dir_prefix: "62/",
                    scrollcontent: [
                        {img: "DSC01469"},
                        {img: "DSC01506"},
                        {img: "DSC01537"},
                        {img: "DSC01332"},
                        {img: "DSC01336"},
                        {img: "DSC01542"},
                        {img: "DSC01574"},
                        {img: "DSC01584"},
                        {img: "DSC01566"},
                        {img: "DSC01566"},
                        {img: "DSC01375"},
                        {img: "DSC01234"},
                        {img: "DSC01391"},
                        {img: "DSC01424"},
                        {img: "DSC01451"},
                    ],
                },
            ],
        },
        {
            tags: ['frankie_eder', 'art', 'still', 'photography', 'landscape'],
            rows: [
                {title: "Smoke over Silverlake"},
                {subtitle: "Silverlake, CA"},
                {subsubtitle: "2020-09-11"},
                {
                    type_photo_scrollbox: true,
                    dir_prefix: "75/",
                    scrollcontent: [
                        {img: "DSC00986"},
                        {img: "DSC01102"},
                        {img: "DSC01085"},
                        {img: "DSC01112"},
                        {img: "DSC00963"},
                        {img: "DSC00958"},
                        {img: "DSC01060"},
                        {img: "DSC00974"},
                        {img: "DSC01014"},
                        {img: "DSC01003"},
                        {img: "DSC01053"},
                        {img: "DSC01044"},
                    ],
                },
            ],
        },
        {
            tags: ['frankie_eder', 'art', 'still', 'manipulated'],
            rows: [
                {title: "Concatenations II"},
                {
                    type_photo_scrollbox: true,
                    dir_prefix: "img/concatenations2/",
                    scrollcontent: [
                        {img: "andy", ext: "jpg"},
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
    ]

}