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
            tags: ['portfolio'],
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
                    dir_prefix: "concatenations2/",
                    ext: "jpg",
                    scrollcontent: [
                        {img: "andy"},
                        {img: "jake"},
                        {img: "jonah"},
                        {img: "kiva"},
                        {img: "olive"},
                        {img: "quinn"},
                        {img: "sofia"},
                        {img: "steve"},
                    ],
                },
                {subsubtitle: "Created by algorithmically combining, filtering, and disfiguring sequenced images of LGBTQ+ individuals, Concatenations II investigates and deconstructs ideas of queer visual representation, recognition, censorship, and identity in a modern-day technology-driven socioeconomic landscape."},
            ],
        },
        {
            tags: ['frankie_eder', 'science', 'research'],
            rows: [
                {title: "Decoding Consumer Grade Video for Film"},
                {subsubtitle: "Flow-Informed Artifact Removal, Chroma Upsampling, and Bit Depth Interpolation"},
                {
                    type_button: true,
                    text: "PAPER",
                    link: "sci/dcgvf.pdf",
                },
                {
                    type_button: true,
                    text: "SLIDES",
                    link: "sci/dcgvf-slides.pdf",
                },
                {
                    type_button: true,
                    text: "CODE",
                    link: "https://github.com/frankieeder/DCGVF",
                },
            ],
        },
        {
            tags: ['frankie_eder', 'science', 'research'],
            rows: [
                {title: "Cinematic Colorization"},
                {subsubtitle: "Analyzes the spatial and temporal characteristics of color in cinema using a newly collected dataset of 1800+ trailers. Utilizes knowledge gained to explore color-based genre classification and automatic color grading. Completed collaboratively with UC Berkeley Visual Computing Lab, Cecilia Zhang (PhD, UC Berkeley), and Vivien Nguyen (MS, UC Berkeley)"},
                {html: `
                    <div class="iframe-container">
                        <iframe src="https://drive.google.com/file/d/1kZudI41b62Z7rBQ4CzV6x_PH54JC-y11/preview"></iframe>
                    </div>
                `},
                {html: '<div style="height: 25px"></div>'},
                {
                    type_button: true,
                    text: "PAPER",
                    link: "sci/cinema-color.pdf",
                },
                {
                    type_button: true,
                    text: "SLIDES",
                    link: "sci/cinema-color-slides.pdf",
                },
                {
                    type_button: true,
                    text: "CODE",
                    link: "https://github.com/viviehn/cinematic-color",
                },
            ],
        },
        {
            tags: ['film', 'commercial'],
            rows: [
                {title: "HIDDEN UNDERWORLD SUMMER 2019"},
                {subtitle: "(a promotional fashion video)"},
                {subsubtitle: "cw: flashing lights"},
                {
                    type_vimeo: true,
                    vimeo: '338578508',
                },
            ],
        },
        {
            tags: ['art', 'experimental', 'portfolio', 'animation'],
            rows: [
                {title: "PIEL"},
                {subtitle: "(an expirimental animated short in progress)"},
                {subsubtitle: "cw: flashing lights"},
                {
                    type_vimeo: true,
                    vimeo: '316463725',
                },
            ],
        },
        {
            tags: ['frankie_eder', 'art', 'film', 'directed_by', 'shot_by', 'edited_by', 'colored_by', 'skateboarding', 'portfolio'],
            rows: [
                {title: "MUTUAL TRANSGRESSION - RAY COREY & CARLOS MONTES"},
                {subtitle: "(a skateboard film series focusing on quality over quantity)"},
                {subsubtitle: "cw: flashing lights"},
                {
                    type_vimeo: true,
                    vimeo: '242977518',
                },
                {
                    type_vimeo: true,
                    vimeo: '242974620',
                },
                {credits: "Director, Director of Photography, Editor, Colorist"},
            ],
        },
        {
            tags: ['frankie_eder', 'film', 'directed_by', 'shot_by', 'edited_by', 'colored_by', 'skateboarding', 'portfolio'],
            rows: [
                {title: "MUTUAL TRANSGRESSION V"},
                {subtitle: "(a skateboard film series focusing on quality over quantity)"},
                {subsubtitle: "cw: flashing lights"},
                {
                    type_vimeo: true,
                    vimeo: '244111603',
                    aspect_ratio: "41.43%",
                },
                {credits: "Director, Director of Photography, Editor, Colorist"},
            ],
        },
        {
            tags: ['frankie_eder', 'film', 'directed_by', 'shot_by', 'edited_by', 'colored_by', 'skateboarding', 'portfolio'],
            rows: [
                {title: "MUTUAL TRANSGRESSION IV"},
                {subtitle: "(a skateboard film series focusing on quality over quantity)"},
                {subsubtitle: "cw: flashing lights"},
                {
                    type_vimeo: true,
                    vimeo: '242981195',
                    aspect_ratio: "41.43%",
                },
                {credits: "Director, Director of Photography, Editor, Colorist"},
            ],
        },
        {
            tags: ['film', 'skateboarding'],
            rows: [
                {title: "MIKEY TAYLOR - UNSEEN VX FOOTAGE"},
                {subsubtitle: "cw: flashing lights"},
                {
                    type_youtube: true,
                    youtube: "WOb1MiGv8zY",
                },
                {credits: "Editor"},
            ],
        },
        {
            tags: ['skateboarding'],
            rows: [
                {title: "MT MINI 1 - MATTHEW PARRA"},
                {subtitle: "(an addendum to the Mutual Transgression skateboard film series)"},
                {subsubtitle: "cw: flashing lights"},
                {
                    type_vimeo: true,
                    vimeo: '236264604',
                    aspect_ratio: "41.43%",
                },
                {credits: "Director, Director of Photography, Editor, Colorist"},
            ],
        },
        {
            tags: ['skateboarding'],
            rows: [
                {title: "MUTUAL TRANSGRESSION II & III"},
                {subtitle: "(a skateboard film series focusing on quality over quantity)"},
                {subsubtitle: "cw: flashing lights"},
                {
                    type_vimeo: true,
                    vimeo: '221785926',
                    aspect_ratio: "41.43%",
                },
                {
                    type_vimeo: true,
                    vimeo: '224680558',
                    aspect_ratio: "41.43%",
                },
                {credits: "Director, Director of Photography, Editor, Colorist"},
            ],
        },
        {
            tags: ['film', 'directed_by', 'shot_by', 'edited_by', 'colored_by', 'skateboarding', 'portfolio'],
            rows: [
                {title: "MUTUAL TRANSGRESSION I (ARCK)"},
                {subtitle: "(a skateboard film series focusing on quality over quantity)"},
                {subsubtitle: "cw: flashing lights"},
                {
                    type_vimeo: true,
                    vimeo: '221788978',
                    aspect_ratio: "41.43%",
                },
                {credits: "Director, Director of Photography, Editor, Colorist"},
            ],
        },
        {
            tags: ['skateboarding'],
            rows: [
                {title: "MUTUAL TRANSGRESSION PROMO"},
                {subtitle: "(a skateboard film series focusing on quality over quantity)"},
                {subsubtitle: "cw: flashing lights"},
                {
                    type_vimeo: true,
                    vimeo: '221787496',
                    aspect_ratio: "41.43%",
                },
                {credits: "Director, Director of Photography, Editor, Colorist"},
            ],
        },
        {
            tags: ['film', 'portfolio'],
            rows: [
                {html: `
                    <h2><a href="https://vimeo.com/221785926">MUTUAL TRANSGRESSION II</a></h2>
                    <h2><a href="https://vimeo.com/224680558">MUTUAL TRANSGRESSION III</a></h2>
                    <h2><a href="https://vimeo.com/221787496">MUTUAL TRANSGRESSION PROMO</a></h2>
                `},
            ],
        },
        {
            tags: ['music'],
            rows: [
                {title: "DYLAN MEDLOCK - ALMOST ALWAYS"},
                {subtitle: "(a take-away style music performance)"},
                {
                    type_vimeo: true,
                    vimeo: '357292232',
                    aspect_ratio: "75%",
                },
                {credits: "Director, Director of Photography, Editor, Colorist"},
            ],
        },
        {
            tags: ['music'],
            rows: [
                {title: "WILFRED BONES - START SOUND"},
                {subsubtitle: "cw: flashing lights"},
                {
                    type_youtube: true,
                    youtube: "5JhgNs0j7hc",
                    aspect_ratio: "41.43%",
                },
                {credits: "Director of Photography, Editor, Colorist"},
            ],
        },
        {
            tags: ['music'],
            rows: [
                {title: "KIVA UHURU - SHADES OF BLUE"},
                {subtitle: "(a take-away style music performance)"},
                {
                    type_vimeo: true,
                    vimeo: '383403898',
                    aspect_ratio: "75%",
                },
                {credits: "Director, Director of Photography, Editor, Colorist"},
            ],
        },
        {
            tags: ['skateboarding'],
            rows: [
                {title: "SHOULDA COULDA WOULDA - CONCEPT EDIT"},
                {subtitle: "(a full-length skate film)"},
                {subsubtitle: "cw: flashing lights"},
                {
                    type_vimeo: true,
                    vimeo: '196241144',
                },
                {credits: "Director, Director of Photography, Editor"},
            ],
        },
        {
            tags: ['skateboarding'],
            rows: [
                {title: "PARKTAGE3"},
                {
                    type_vimeo: true,
                    vimeo: '478344244',
                },
                {credits: "Director, Director of Photography, Editor"},
            ],
        },
        {
            tags: ['skateboarding'],
            rows: [
                {title: "BABYLON"},
                {subtitle: "(a focused short skate film)"},
                {
                    type_vimeo: true,
                    vimeo: '477411214',
                },
                {credits: "Director, Director of Photography, Editor"},
                {html: "<h5>Awards: <i>Honorable Mention in Sports Category</i>, SoCal Student Film Festival, 2017</h5>"},
            ],
        },
        {
            tags: ['experimental', 'animation'],
            rows: [
                {title: "WEIGHT"},
                {subtitle: "(an experimental stop-motion film)"},
                {
                    type_vimeo: true,
                    vimeo: '182605434',
                    aspect_ratio: '41.43%',
                },
                {credits: "Director, Director of Photography, Editor"},
                {html: "<h5>Awards: <i>Honorable Mention in Sports Category</i>, SoCal Student Film Festival, 2017</h5>"},
            ],
        },
        {
            tags: ['narrative', 'shot_by'],
            rows: [
                {title: "SHEEP AND GOATS"},
                {
                    type_youtube: true,
                    youtube: "ZxNIRfgedfg",
                    aspect_ratio: '41.43%',
                },
                {credits: "Director of Photography"},
                {html: "<h5>Awards: <i>Best Cinematography</i>, CineBears Film Festival 2017</h5>"},
            ],
        },
        {
            tags: ['still', 'manipulated'],
            rows: [
                {title: "2-D_15"},
                {
                    type_image: true,
                    dir_prefix: 'visual/full/',
                    img: '2-D_15',
                    ext: 'jpg',
                },
            ],
        },
        {
            tags: ['photography'],
            rows: [
                {title: "2-D_41"},
                {
                    type_image: true,
                    dir_prefix: 'visual/full/',
                    img: '2-D_41',
                    ext: 'jpg',
                },
            ],
        },
        {
            tags: ['still', 'manipulated'],
            rows: [
                {title: "2-D_00001"},
                {
                    type_image: true,
                    dir_prefix: 'visual/full/',
                    img: '2-D_00001',
                    width: "40%",
                    ext: 'jpg',
                },
            ],
        },
        {
            tags: ['still', 'photography'],
            rows: [
                {title: "2-D_00034"},
                {
                    type_image: true,
                    dir_prefix: 'visual/full/',
                    img: '2-D_00034',
                    width: "40%",
                    ext: 'jpg',
                },
            ],
        },
        {
            tags: ['still', 'photography', 'manipulated'],
            rows: [
                {title: "(      )"},
                {
                    type_image: true,
                    dir_prefix: 'visual/full/',
                    img: '()',
                    ext: 'jpg',
                },
                {title: ")      ("},
                {
                    type_image: true,
                    dir_prefix: 'visual/full/',
                    img: ')(',
                    ext: 'png',
                },
            ],
        },
        {
            tags: ['still', 'photography', 'skate_photography'],
            rows: [
                {title: "2-D_143"},
                {
                    type_image: true,
                    dir_prefix: 'visual/full/',
                    img: '2-D_143',
                    ext: 'jpg',
                },
            ],
        },
        {
            tags: ['manipulated'],
            rows: [
                {title: "2-D_37c"},
                {
                    type_image: true,
                    dir_prefix: 'visual/full/',
                    img: '2-D_37c',
                    ext: 'jpg',
                },
            ],
        },
        {
            tags: ['photography'],
            rows: [
                {title: "2-D_131"},
                {
                    type_image: true,
                    dir_prefix: 'visual/full/',
                    img: '2-D_131',
                    ext: 'jpg',
                },
            ],
        },
        {
            tags: ['photography'],
            rows: [
                {title: "2-D_137"},
                {
                    type_image: true,
                    dir_prefix: 'visual/full/',
                    img: '2-D_137',
                    ext: 'jpg',
                },
            ],
        },
        {
            tags: ['skate_photography'],
            rows: [
                {title: "Ray Corey - Front Board Backside Flip"},
                {
                    type_image: true,
                    dir_prefix: 'visual/full/',
                    img: 'RayCoreyFrontBoardBacksideFlip',
                    ext: 'jpg',
                },
            ],
        },
        {
            tags: ['skate_photography'],
            rows: [
                {title: "Matthew Parra - Backside 180"},
                {
                    type_image: true,
                    dir_prefix: 'visual/full/',
                    img: 'MatthewParraBackside180',
                    ext: 'jpg',
                },
            ],
        },
        {
            tags: ['still', 'mathematica'],
            rows: [
                {title: "N - 2"},
                {
                    type_image: true,
                    dir_prefix: 'visual/full/',
                    img: 'N - 2',
                    ext: 'jpg',
                },
            ],
        },
        {
            tags: ['still', 'mathematica'],
            rows: [
                {title: "n - 3"},
                {
                    type_image: true,
                    dir_prefix: 'visual/full/',
                    img: 'n-3',
                    width: "40%",
                    ext: 'jpg',
                },
            ],
        },
        {
            tags: ['mathematica'],
            rows: [
                {title: "n - 2"},
                {
                    type_image: true,
                    dir_prefix: 'visual/full/',
                    img: 'n-2',
                    width: "40%",
                    ext: 'jpg',
                },
            ],
        },
        {
            tags: ['mathematica'],
            rows: [
                {title: "n - 1"},
                {
                    type_image: true,
                    dir_prefix: 'visual/full/',
                    img: 'n-1',
                    ext: 'png',
                },
            ],
        },
        {
            tags: ['mathematica'],
            rows: [
                {title: "N - 5"},
                {
                    type_image: true,
                    dir_prefix: 'visual/full/',
                    img: 'N - 5',
                    ext: 'jpg',
                },
            ],
        },
        {
            tags: ['mathematica'],
            rows: [
                {title: "N - 1.2"},
                {
                    type_image: true,
                    dir_prefix: 'visual/full/',
                    img: 'N - 1-2',
                    ext: 'png',
                },
            ],
        },
        {
            tags: ['mathematica'],
            rows: [
                {title: "N - 3"},
                {
                    type_image: true,
                    dir_prefix: 'visual/full/',
                    img: 'N - 3',
                    ext: 'png',
                },
            ],
        },
        {
            tags: ['mathematica'],
            rows: [
                {title: "N - 4"},
                {
                    type_image: true,
                    dir_prefix: 'visual/full/',
                    img: 'N - 4',
                    ext: 'png',
                },
            ],
        },
        {
            tags: ['mathematica'],
            rows: [
                {title: "N - 4"},
                {
                    type_image: true,
                    dir_prefix: 'visual/full/',
                    img: 'N - 4',
                    ext: 'png',
                },
            ],
        },
        // SOUND
        {
            tags: ['audio', 'portfolio'],
            rows: [
                {
                    type_soundcloud: true,
                    soundcloud: 124602909,
                },
            ],
        },
        {
            tags: ['audio', 'portfolio'],
            rows: [
                {
                    type_soundcloud: true,
                    soundcloud: 96819631,
                },
            ],
        },
        {
            tags: ['audio'],
            rows: [
                {
                    type_soundcloud: true,
                    soundcloud: 282640338,
                },
            ],
        },
        {
            tags: ['audio'],
            rows: [
                {
                    type_soundcloud: true,
                    soundcloud: 201123325,
                },
            ],
        },
        {
            tags: ['audio'],
            rows: [
                {
                    type_bandcamp: true,
                    album: 467462218,
                    track: 1052612252
                },
            ],
        },
        {
            tags: ['audio'],
            rows: [
                {
                    type_bandcamp: true,
                    album: 467462218,
                    track: 3006023100
                },
            ],
        },
        {
            tags: ['audio'],
            rows: [
                {
                    type_soundcloud: true,
                    soundcloud: 97761985,
                },
            ],
        },
        {
            tags: ['audio'],
            rows: [
                {
                    type_soundcloud: true,
                    soundcloud: 66437050,
                },
            ],
        },
        {
            tags: ['audio'],
            rows: [
                {
                    type_soundcloud: true,
                    soundcloud: 223452063,
                },
            ],
        },
        {
            tags: ['audio'],
            rows: [
                {
                    type_soundcloud: true,
                    soundcloud: 76637142,
                },
            ],
        },
        {
            tags: ['audio'],
            rows: [
                {
                    type_soundcloud: true,
                    soundcloud: 76636963,
                },
            ],
        },
        {
            tags: ['audio'],
            rows: [
                {
                    type_soundcloud: true,
                    soundcloud: 56977981,
                },
            ],
        },
        {
            tags: ['audio'],
            rows: [
                {
                    type_soundcloud: true,
                    soundcloud: 48650330,
                },
            ],
        },

        // CODE
        {
            tags: ['science', 'implementations'],
            rows: [
                {title: "IMAGETOOLS"},
                {subsubtitle: "Python image manipulation package for experimental artmaking"},
                {
                    type_button: true,
                    text: "CODE",
                    link: "https://github.com/frankieeder/imagetools",
                },
            ],
        },
        {
            tags: ['science', 'implementations'],
            rows: [
                {title: "fantasy_movie_league"},
                {subsubtitle: "Predicts box-office earnings using machine learning, and subsequently predicts the best Fantasy Movie League using an object-oriented approah to the knapsack problem."},
                {
                    type_button: true,
                    text: "CODE",
                    link: "https://github.com/frankieeder/fantasy_movie_league",
                },
            ],
        },
        {
            tags: ['implementations'],
            rows: [
                {title: "Movie Data Scraper"},
                {subsubtitle: "Python Package for collectiong data from major movie data websites."},
                {
                    type_button: true,
                    text: "CODE",
                    link: "https://github.com/frankieeder/movie_data_scraper",
                },
            ],
        },
        {
            tags: ['science', 'research'],
            rows: [
                {title: "Amodal3DetTF"},
                {subsubtitle: "A TensorFlow re-implementation of object detection algorithms presented in 'Amodal Detection of 3D Objects: Inferring 3D Bounding Boxes from 2D Ones in RGB-Depth Images' (Deng et al.) for use on mobile devices. Completed as a computer vision researcher in UC Berkeley's Video and Image Processing Lab"},
                {
                    type_button: true,
                    text: "CODE",
                    link: "https://github.com/frankieeder/Amodal3Det_TF",
                },
            ],
        },
        {
            tags: ['research'],
            rows: [
                {title: "Orthogonal Structure Detection"},
                {subsubtitle: "Extends use cases of a CVPR 2016 paper, proving comparable results on original dataset and invariance to wall shape with an IOU decrease of less than 5% on non-planar wall cases. No learning required."},
                {
                    type_button: true,
                    text: "CODE",
                    link: "https://github.com/frankieeder/orthogonal_structure_detection",
                },
            ],
        },




// TODO: Vimeo Thumbnails
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