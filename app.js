// map section


d3.queue()
    .defer(d3.csv, './data/LUDN_1344_CREL_20190926124952.csv', formatter)
    .defer(d3.csv, './data/LUDN_2137_CREL_20190926124728.csv', formatter)
    .defer(d3.csv, './data/STAN_1651_CREL_20190926121647.csv', formatter)
    .defer(d3.json, './data/Wojewodztwa.json')
    .await(function (error, deathData, populationData, polutionData, geoData) {
        if (error) throw error;
        let colors = [
            '#00FFFF', //"DOLNOŚLĄSKIE" śląskie         200000                      2400000
            '#000000', //"KUJAWSKO-POMORSKIE" Opolskie          400000              1600000
            '#0000FF', //"LUBELSKIE" Wielkopolskie          600000                  3000000
            '#64d6ba', //"LUBUSKIE" Zachodniopomorskie         800000               3200000
            '#008000', //"ŁÓDZKIE" Świętokrzyskie           1000000                 2600000
            '#00FF00', //"MAŁOPOLSKIE" Kujawsko-pomorskie           1200000         400000
            '#000080', //"MAZOWIECKIE" Podlaskie            1400000                 2000000
            '#808000', //"OPOLSKIE" dolnośląskie            1600000                 200000
            '#800080', //"PODKARPACKIE" Podkarpackie           1800000              1800000
            '#FF0000', //"PODLASKIE" Małopolskie            2000000                 1200000
            '#C0C0C0', //"POMORSKIE" Pomorskie          2200000                     2200000
            '#008080', //"ŚLĄSKIE" Warmińsko-mazurskie          2400000             2800000
            '#FFFFFF', //"ŚWIĘTOKRZYSKIE" Łódzkie           2600000                 1000000
            '#FFFF00', //"WARMIŃSKO-MAZURSKIE" Mazowieckie          2800000         1400000
            '#FF00FF', //"WIELKOPOLSKIE" Lubelskie          3000000                 600000
            '#808080' //"ZACHODNIOPOMORSKIE" Lubuskie           3200000             800000
        ];
        let wojewodz = [
            200000,
            400000,
            600000,
            800000,
            1000000,
            1200000,
            1400000,
            1600000,
            1800000,
            2000000,
            2200000,
            2400000,
            2600000,
            2800000,
            3000000,
            3200000
        ];



        let select = d3.select('select');
        let minYear = Math.max(d3.min(deathData, d => d.wojYear), d3.min(populationData, d => d.wojYear), d3.min(polutionData, d => d.wojYear));
        let maxYear = Math.min(d3.max(deathData, d => d.wojYear), d3.max(populationData, d => d.wojYear), d3.max(polutionData, d => d.wojYear));
        let newData = deleteYears(minYear, maxYear, deathData, populationData, polutionData);
        const height = 600;
        const width = 600;
        let geo = topojson.feature(geoData, geoData.objects.Wojewodztwa).features;

        newData[2].forEach(row => {
            var wojs = geo.filter(d => Number(d.id) === row.wojCode);
            wojs.forEach(woj => woj.properties = row);
        });

        let projection = d3.geoMercator()
            .scale(3000)
            .translate([width - 1300, height + 2900]);

        var path = d3.geoPath()
            .projection(projection);

        let mapSVG = d3.select('#map')
            .attr('width', width)
            .attr('height', height)
            .selectAll('path')
            .data(geo)
            .enter()
            .append('path')
            .classed('woj', true)
            .attr('d', path);


        select
            .on('change', d => {
                setColor(d3.event.target.value)
            });

        setColor(select.property('value'));

        function setColor(val) {
            // console.log(val);
            let colorRanges = {
                'nie zorganizowana': ['white', 'purple'],
                'dwutlenek węgla': ['white', 'red'],
                'tlenki azotu': ['white', 'blue'],
                'tlenek węgla': ['white', 'black'],
                'podtlenek azotu': ['white', 'green'],
                'metan': ['white', 'orange'],
                'dwutlenek siarki': ['white', 'yellow']
            };
            let colorScale = d3.scaleLinear()
                .domain(0, d3.extent(newData[2], d => d.wojValue))
                .range(colorRanges[val]);

            d3.selectAll('.woj')
                .transition()
                .duration(750)
                .ease(d3.easeBackIn)
                .attr('fill', d => {
                    // let data = d.filter(e => e.kindOfPollution === val);
                    // // console.log(data);
                    // return data ? colorScale(data) : '#ccc';
                });
        }


    });


function deleteYears(minYear, maxYear, ...args) {
    let newData = [];
    args.forEach(arg => {
        newData.push(arg.filter(row => {
            return row.wojYear > minYear && row.wojYear < maxYear;
        }));
    });
    formatAllData(newData);
}


function formatter(row) {
    let obj = {
        wojCode: +row.Kod,
        wojName: row.Nazwa,
        wojYear: +row.Rok,
        wojValue: +row.Wartosc
    }

    if (row["Rodzaje zanieczyszczen"]) {
        obj['kindOfPollution'] = row['Rodzaje zanieczyszczen'];
    }
    return obj;
}

function formatAllData(...args) {
    // console.log(args);
    let completeObj = {};
    args.forEach(arr => {
        arr.forEach(subArr => {
            subArr.forEach(row => {
                console.log(row)
                let woj = row.wojCode;
                if (!completeObj[row.wojYear]) completeObj[row.wojYear] = [];

                let yearArr = completeObj[row.wojYear];
                let wojObj = yearArr.finc(el => el.wojCode === woj);
                // if (wojObj) wojObj[]
                // let wojObj = yearArr.find(el => {

                //     el[row.wojYear[woj]] === woj;
                //     console.log(el);
                // });
                // console.log(wojObj);
                // if (yearArr.indexOf(row.wojCode) === -1) yearArr[row.wojCode] = [];
                // console.log('year arr: ' + yearArr);
                // let wojObj = yearArr.find(el => el.wojCode === woj);
                // console.log(wojObj)
                // if (!wojObj) yearArr[woj] = [];


            })
            console.log(completeObj);
        })
    })
}