/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

(function () {
    const TYPE_INFO = {
        type: "chart",
        name: "Chart",
        version: "0.0.2",
        author: "Lobaro",
        kind: "widget",
        description: "Renders a chart.",
        dependencies: [
            "https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.16/d3.min.js",
            "https://cdnjs.cloudflare.com/ajax/libs/c3/0.4.10/c3.min.js",
            "https://cdnjs.cloudflare.com/ajax/libs/c3/0.4.10/c3.min.css"
        ],
        settings: [
            {
                id: 'datasource',
                name: 'Datasource',
                type: 'datasource'
            },
            {
                id: 'chartType',
                name: 'Chart Type',
                type: 'option',
                defaultValue: 'spline',
                options: [
                    'line',
                    'spline',
                    'step',
                    'area',
                    'area-spline',
                    'area-step',
                    'bar',
                    'scatter',
                    'pie',
                    'donut',
                    'gauge'
                ]
            },
            {
                id: 'dataKeys',
                type: "json",
                name: "Data Keys",
                description: "An array of Keys of an data object that define the data sets",
                defaultValue: '["value"]'
            },
            {
                id: 'xKey',
                type: "string",
                name: "X Key",
                description: "Key of an data object that defines the X value",
                defaultValue: "x"
            },
            {
                id: 'names',
                type: "json",
                name: "Data Names",
                description: "Json object that maps Data Keys to displayed names",
                defaultValue: '{"value": "My Value"}'
            },
            {
                id: 'gaugeData',
                type: "json",
                name: "Gauge Data",
                description: "Json object that is passed as configuration for gauge chats",
                defaultValue: JSON.stringify({"min": 0, "max": 100, units: ' %'})
            }/*,
             {
             id: 'donutData',
             type: "json",
             name: "Gauge Data",
             description: "Json object that maps Data Keys to displayed names",
             defaultValue: JSON.stringify({title: 'Title'})
             }*/
        ]
    };

    function safeParseJsonObject(string) {
        try {
            return JSON.parse(string);
        }
        catch (e) {
            console.error("Was not able to parse JSON: " + string);
            return {}
        }
    }

    function safeParseJsonArray(string) {
        try {
            return JSON.parse(string);
        }
        catch (e) {
            console.error("Was not able to parse JSON: " + string);
            return {}
        }
    }

    class Widget extends React.Component {

        componentDidMount() {
            this._createChart(this.props);
        }

        componentWillReceiveProps(nextProps) {
            if (nextProps.state.settings !== this.props.state.settings
                || nextProps.state.height !== this.props.state.height) {
                this._createChart(nextProps);
            }
        }

        getData() {
            const props = this.props;
            const config = props.state.settings;
            let data = props.getData(config.datasource);
            if (data.length > 0 && config.chartType == "gauge") {
                data = [data[data.length - 1]]
            }
            return data
        }

        _createChart(props) {
            const config = props.state.settings;

            this.chart = c3.generate({
                bindto: '#chart-' + props.state.id,
                size: {
                    height: props.state.availableHeightPx
                },
                data: {
                    json: this.getData(),
                    type: config.chartType,
                    // Seems not to work with chart.load, so on update props we have to recreate the chart to update
                    names: safeParseJsonObject(config.names),
                    keys: {
                        x: config.xKey ? config.xKey : undefined,
                        value: safeParseJsonArray(config.dataKeys)
                    }
                },
                axis: {
                    x: {
                        tick: {
                            culling: false
                        }
                    }
                },
                gauge: safeParseJsonObject(config.gaugeData),
                donut: {
                    label: {
                        show: false
                    }
                },
                transition: {
                    duration: 0
                }
            })

        }

        _renderChart() {
            if (!this.chart) {
                return;
            }
            const props = this.props;
            const settings = props.state.settings;

            this.chart.load({
                json: this.getData(),
                keys: {
                    x: settings.xKey || undefined,
                    value: safeParseJsonObject(settings.dataKeys)
                },
                labels: false
            });


        }

        render() {
            this._renderChart();
            return <div className="" id={'chart-' + this.props.state.id}></div>
        }

        componentWillUnmount() {
            console.log("Unmounted Chart Widget");
        }

        dispose() {
            console.log("Disposed Chart Widget");
        }
    }

// TODO: Move to core, for simple reuse
    const Prop = React.PropTypes
    Widget.propTypes = {
        getData: Prop.func.isRequired,
        state: Prop.shape({
            height: Prop.number.isRequired,
            id: Prop.string.isRequired
        }).isRequired
    };

    window.iotDashboardApi.registerWidgetPlugin(TYPE_INFO, Widget);

})();
