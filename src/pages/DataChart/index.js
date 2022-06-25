import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { Column } from '@ant-design/plots';
import { Row, Col, Card } from 'antd'
import {
    PartitionOutlined,
    SaveOutlined,
    BellOutlined,
    AlertOutlined
} from '@ant-design/icons';
import moment from 'moment'

export default () => {
    const [dataTable, setDataTable] = useState({});
    const [gpsData, setGpsData] = useState([]);
    const [weekData, setWeekData] = useState([]);
    const [monthData, setMonthData] = useState([]);
    const [seriesData, setSeriesData] = useState([]);


    const { area } = JSON.parse(localStorage.getItem('userInfo'))
    const getMonthBetween = (start, end) => {
        const startDate = moment(start);
        const endDate = moment(end);
        const allYearMonth = []; // 接收所有年份和月份的数组

        while (endDate > startDate || startDate.format('YYYY-MM-DD') === endDate.format('YYYY-MM-DD')) {
            allYearMonth.push(startDate.format('YYYY-MM-DD'));
            startDate.add(1, 'day');
        }
        return allYearMonth
    }

    useEffect(() => {
        fetch(`${window.urlApi}/device/getAllDeviceGpsOneData?area=${area}`, {
            headers: {
                'Authorization': window.sessionStorage.getItem('token')
            }
        })
            .then((response) => response.json())
            .then((json) => {
                if (!json?.data) {
                    return
                }
                setGpsData(json?.data)
            })

        fetch(`${window.urlApi}/device/getDeviceInfo`, {
            method: 'POST',
            mode: 'cors',
            body: JSON.stringify({
                engineNumber: "",
                frameNumber: "",
                idCard: "",
                numberPlate: "",
                pageNumber: 1,
                pageSize: 8,
                phoneNumber: "",
                area
            }),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': window.sessionStorage.getItem('token')
            },
        }).then((response) => response?.json()).then(({ data }) => {
            setDataTable(data)
        }).catch(() => {
            setDataTable({})
        })

        let weekstart = moment().weekday(1).format('YYYY-MM-DD') //本周一
        let weekEnd = moment().weekday(7).format('YYYY-MM-DD') //本周日

        fetch(`${window.urlApi}/device/getStatisticsInfo?area=${area}`, {
            method: 'POST',
            mode: 'cors',
            body: JSON.stringify({
                endTime: weekEnd,
                startTime: weekstart,
                area
            }),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': window.sessionStorage.getItem('token')
            },
        })
            .then((response) => response.json())
            .then((json) => {
                if (json?.data) {
                    const weekName = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
                    const ddd = weekName.map((item, index) => {
                        const number = json?.data[index]?.carCount || 0
                        return {
                            '安装数量': number,
                            name: item
                        }
                    })

                    setWeekData(ddd)
                }
            })

        let lastMonthStart = moment().subtract(1, 'month').startOf('month').format('YYYY-MM-DD') //上月开始
        let lastMonthEnd = moment().subtract(1, 'month').endOf('month').format('YYYY-MM-DD') // 上月结束


        let monthStart = moment().startOf('month').format('YYYY-MM-DD') //月开始
        let monthEnd = moment().endOf('month').format('YYYY-MM-DD') //月结束

        fetch(`${window.urlApi}/device/getStatisticsInfo?area=${area}`, {
            method: 'POST',
            mode: 'cors',
            body: JSON.stringify({
                endTime: monthEnd,
                startTime: monthStart,
                area
            }),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': window.sessionStorage.getItem('token')
            },
        })
            .then((response) => response.json())
            .then((json) => {
                const months = getMonthBetween(monthStart, monthEnd)
                const ddd = months.map((i) => {
                    const finde = json?.data?.find(({ createDay }) => i === createDay)
                    return {
                        '安装数量': finde?.carCount || 0,
                        name: i,
                    }
                })
                setMonthData(ddd)

                // 堆叠
                fetch(`${window.urlApi}/device/getStatisticsInfo?area=${area}`, {
                    method: 'POST',
                    mode: 'cors',
                    body: JSON.stringify({
                        endTime: lastMonthEnd,
                        startTime: lastMonthStart,
                        area
                    }),
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': window.sessionStorage.getItem('token')
                    },
                })
                    .then((response) => response.json())
                    .then((lastJson) => {
                        const lastMonths = getMonthBetween(lastMonthStart, lastMonthEnd)

                        const last = lastMonths.map((i) => {
                            const finde = lastJson?.data?.find(({ createDay }) => i === createDay)
                            return {
                                '安装数量': finde?.carCount || 0,
                                name: moment(i).format('DD'),
                                'type': "上月"
                            }
                        })
                        setSeriesData([...ddd.map((item) => ({
                            ...item,
                            name: moment(item.name).format('DD'),
                            'type': '本月'
                        })), ...last])
                    })
            })
    }, [])

    const configWeek = {
        data: weekData,
        xField: 'name',
        yField: '安装数量',
        optional: {
            width: '100px',
        },
        label: {
            // 可手动配置 label 数据标签位置
            position: 'middle',
            // 'top', 'bottom', 'middle',
            // 配置样式
            style: {
                fill: '#FFFFFF',
                opacity: 0.6,
            },
        },
        xAxis: {
            label: {
                autoHide: true,
                autoRotate: false,
            },
        },
        meta: {
            type: {
                alias: '类别',
            },
            sales: {
                alias: '销售额',
            },
        },
    }

    const configMonth = {
        data: monthData,
        xField: 'name',
        yField: '安装数量',
        label: {
            // 可手动配置 label 数据标签位置
            position: 'middle',
            // 'top', 'bottom', 'middle',
            // 配置样式
            style: {
                fill: '#FFFFFF',
                opacity: 0.6,
            },
        },
        xAxis: {
            label: {
                autoHide: true,
                autoRotate: false,
            },
        },
        meta: {
            type: {
                alias: '类别',
            },
            sales: {
                alias: '销售额',
            },
        },
    }

    const configThirtyDay = {
        data: seriesData,
        xField: 'name',
        yField: '安装数量',
        isStack: true,
        seriesField: 'type',
        label: {
            // 可手动配置 label 数据标签位置
            position: 'middle',
            // 'top', 'bottom', 'middle'
            // 可配置附加的布局方法
            layout: [
                // 柱形图数据标签位置自动调整
                {
                    type: 'interval-adjust-position',
                }, // 数据标签防遮挡
                {
                    type: 'interval-hide-overlap',
                }, // 数据标签文颜色自动调整
                {
                    type: 'adjust-color',
                },
            ],
        },
    }
    return <>
        <div className='dataChart'>
            <section className='dataChart_head'>
                <Row justify="space-between">
                    <Col span={6} >
                        <Card bordered={false} className="dataChart_head_text">
                            <PartitionOutlined />上线设备： {gpsData?.length}
                        </Card>
                    </Col>
                    <Col span={6} >
                        <Card bordered={false} className="dataChart_head_text">
                            <SaveOutlined /> 注册设备： {dataTable?.totalElements}
                        </Card>
                    </Col>
                    <Col span={6} >
                        <Card bordered={false} className="dataChart_head_text">
                            <BellOutlined />异常设备： 0
                        </Card>
                    </Col>
                    <Col span={6} >
                        <Card bordered={false} className="dataChart_head_text">
                            <AlertOutlined />报警设备：0
                        </Card>
                    </Col>
                </Row>
            </section>
            <section className='dataChart_content'>
                <Row justify="space-between">
                    <Col span={12} >
                        <Card title="本周安装量" bordered={false}>
                            <Column {...configWeek} />
                        </Card>
                    </Col>
                    <Col span={12} >
                        <Card title="本月安装量" bordered={false}>
                            <Column {...configMonth} />
                        </Card>
                    </Col>
                </Row>
                <Row justify="space-between">
                    <Col span={24} >
                        <Card title="上月与本月对比" bordered={false}>
                            <Column {...configThirtyDay} />
                        </Card>
                    </Col>
                </Row>
            </section>
        </div>
    </>
}