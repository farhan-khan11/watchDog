// import React from 'react'
import React, { useState, useEffect } from 'react'
import classNames from 'classnames'

import {
  CAvatar,
  CButton,
  CButtonGroup,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCol,
  CProgress,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cibCcAmex,
  cibCcApplePay,
  cibCcMastercard,
  cibCcPaypal,
  cibCcStripe,
  cibCcVisa,
  cibGoogle,
  cibFacebook,
  cibLinkedin,
  cifBr,
  cifEs,
  cifFr,
  cifIn,
  cifPl,
  cifUs,
  cibTwitter,
  cilCloudDownload,
  cilPeople,
  cilUser,
  cilUserFemale,
} from '@coreui/icons'

import avatar1 from 'src/assets/images/avatars/1.jpg'
import avatar2 from 'src/assets/images/avatars/2.jpg'
import avatar3 from 'src/assets/images/avatars/3.jpg'
import avatar4 from 'src/assets/images/avatars/4.jpg'
import avatar5 from 'src/assets/images/avatars/5.jpg'
import avatar6 from 'src/assets/images/avatars/6.jpg'

import WidgetsBrand from '../widgets/WidgetsBrand'
import WidgetsDropdown from '../widgets/WidgetsDropdown'
import MainChart from './MainChart'
import { CChart, CChartBar } from '@coreui/react-chartjs'


import { DocsLink } from 'src/components'


// data 
import useMetrics from '../../hooks/useMetrics.js'


const Dashboard = () => {

  const metrics = useMetrics();

  const [cpuHistory, setCpuHistory] = useState([]);
  const [timeLabels, setTimeLabels] = useState([]);

  const isSuspicious = (ip) => {
    return ip && !ip.startsWith('tty') && ip !== 'login screen' && ip !== ':0'
  }

  useEffect(() => {
    if (!metrics) return;

    setCpuHistory(prev => [...prev.slice(-19), metrics.cpuUsage]);

    setTimeLabels(prev => [
      ...prev.slice(-19),
      new Date().toLocaleTimeString(),
    ]);
  }, [metrics]);

  if (!metrics) return <h3>Waiting for Live Metrics</h3>

  let cpuUsage = metrics.cpuUsage
  let memoryUsage = metrics.memoryUsagePercentage

  const PieChartCpuUsageColor = cpuUsage < 70 ? '#FF6384' : 'red'
  const barChartCPUusage = cpuUsage < 70 ? '#FFA500' : 'red'
  const barChartMemoryusage = memoryUsage < 70 ? '#808080' : 'red'

  return (
    <>
      <h2>Watchdog Dashboard</h2>
      <p>Metrics will appear here</p>

      <CRow>
        <CCol sm={4}>
          <CCard className='mb-4'>
            <CCardHeader>Machine ID</CCardHeader>
            <CCardBody>
              <h5>{metrics.machineId}</h5>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol sm={4}>
          <CCard className='mb-4'>
            <CCardHeader>OS Type</CCardHeader>
            <CCardBody>
              <h5>{metrics.osType}</h5>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol sm={4}>
          <CCard className='mb-4'>
            <CCardHeader>Uptime</CCardHeader>
            <CCardBody>
              <h5>{metrics.upTime}</h5>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol sm={6}>
          <CCard className='mb-4'>
            <CCardHeader>CPU Usage</CCardHeader>
            <CCardBody>
              <h2>{metrics.cpuUsage}%</h2>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol sm={6}>
          <CCard className='mb-4'>
            <CCardHeader>Memory Usage</CCardHeader>
            <CCardBody>
              <h2>{metrics.memoryUsagePercentage}%</h2>
              <p>
                {metrics.usedMemory} GB / {metrics.totalMemory} GB
                {/* {metrics.usedMemory} GB / {(metrics.totalMemory).toFixed(2)} GB */}
              </p>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol xs={12}>
          <CCard className='mb-4'>
            <CCardHeader>Login History</CCardHeader>
            <CCardBody>
              <CTable hover>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>User</CTableHeaderCell>
                    <CTableHeaderCell>Terminal</CTableHeaderCell>
                    <CTableHeaderCell>Login Time</CTableHeaderCell>
                    <CTableHeaderCell>Logout Time</CTableHeaderCell>
                    <CTableHeaderCell>Source IP</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {metrics.loginHistory?.map((entry, i) => (
                    <CTableRow key={i} color={isSuspicious(entry.sourceIp) ? 'danger' : ''}>
                      <CTableDataCell>{entry.user}</CTableDataCell>
                      <CTableDataCell>{entry.terminal}</CTableDataCell>
                      <CTableDataCell>{entry.loginTime}</CTableDataCell>
                      <CTableDataCell>{entry.logoutTime}</CTableDataCell>
                      <CTableDataCell>{entry.sourceIp}</CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCol>

        {/* <CCardBody>
          <MainChart />
        </CCardBody> */}

        <CCardBody>
          <MainChart
            cpuHistory={cpuHistory}
            timeLabels={timeLabels}
          />
        </CCardBody>

        <CCol xs={6}>
          <CCard className="mb-4">
            <CCardHeader>
              Pie Chart
            </CCardHeader>
            <CCardBody>
              {/* <CChart
                type="pie"

                data={{
                  labels: ['CPU Used', "CPU Free"],
                  datasets: [
                    {
                      data: [cpuUsage, 100 - cpuUsage],
                      backgroundColor: [PieChartCpuUsageColor, '#00FF00'],
                      // asdnajksbajk
                    },
                  ],
                }}
              /> */}
              <CChart
                type="pie"
                options={{
                  animation: false,
                }}
                data={{
                  labels: ['CPU Used', 'CPU Free'],
                  datasets: [
                    {
                      data: [cpuUsage, 100 - cpuUsage],
                      backgroundColor: [PieChartCpuUsageColor, '#00FF00'],
                    },
                  ],
                }}
              />
            </CCardBody>
          </CCard>
        </CCol>

        <CCol xs={6}>
          <CCard className="mb-4">
            <CCardHeader>
              Bar Chart
            </CCardHeader>
            <CCardBody>
              {/* <CChartBar
                data={{
                  labels: ['System Usage'],
                  datasets: [
                    {
                      label: 'CPU-Usage',
                      data: [cpuUsage],
                      backgroundColor: barChartCPUusage,
                    },
                    {
                      label: 'Memory-Usage',
                      data: [memoryUsage],
                      backgroundColor: barChartMemoryusage,
                    },
                  ],
                }}
              /> */}
              <CChartBar
                options={{
                  animation: false,
                  responsive: true,
                  maintainAspectRatio: true,
                }}
                data={{
                  labels: ['System Usage'],
                  datasets: [
                    {
                      label: 'CPU-Usage',
                      data: [cpuUsage],
                      backgroundColor: barChartCPUusage,
                    },
                    {
                      label: 'Memory-Usage',
                      data: [memoryUsage],
                      backgroundColor: barChartMemoryusage,
                    },
                  ],
                }}
              />
            </CCardBody>
          </CCard>
        </CCol>

      </CRow>
    </>
  )
}

export default Dashboard