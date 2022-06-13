import {useEffect, useRef} from 'react'
import './index.css';
import MapContainer from '../../components/mapContainer'
import { Descriptions } from 'antd';

export default () => {
  const mapContainer = useRef(null)
  const defaultData = JSON.parse(window.localStorage.getItem('data'))
  
  const list = [
    {
      label: '设备识别码',
      name: 'deviceId',
    },
    {
      label: '创建时间',
      name: 'createDateTime'
    },
    {
      label: '使用年限',
      name: 'usePeriod'
    },
    {
      label: '身份证',
      name: 'idCard',
    },
    {
      label: '手机号',
      name: 'phoneNumber',
    },
    {
      label: '车架号',
      name: 'frameNumber',
    },
    {
      label: '车牌号',
      name: 'numberPlate',
    },
    {
      label: '发动机号',
      name: 'engineNumber',
    }, {
      label: '牌子',
      name: 'brand',
    }, {
      label: '颜色',
      name: 'color',
    }, {
      label: '经销商地址',
      name: 'dealerAddress',
    }, {
      label: '状态',
      name: 'status',
    }, {
      label: '备注',
      name: 'remark',
    },
  ]


  return (
    <div className="detail-page">
      <Descriptions title="实时监控">
        {
          list.map(({label,name}, index)=> {
            return <Descriptions.Item key={index} label={label}> {defaultData[name]} </Descriptions.Item>
          })
        }
      </Descriptions>
      
      <MapContainer ref={mapContainer} />
    </div>
  );
}
