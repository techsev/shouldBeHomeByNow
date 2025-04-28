import { useState, useEffect } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger
} from '@/components/ui/sidebar'
import { supabase } from '@/lib/supabase'

const LOCATION_DATA = {
  kidA: {
    name: 'kidA',
    schedule: [
      {
        startTime: '00:00',
        endTime: '07:00',
        location: 'Home'
      },
      {
        startTime: '07:00',
        endTime: '07:20',
        location: 'Walking to Bus Stop'
      },
      {
        startTime: '07:20',
        endTime: '07:30',
        location: 'Waiting for Bus'
      },
      {
        startTime: '07:30',
        endTime: '08:00',
        location: 'Bus to School'
      },
      {
        startTime: '08:00',
        endTime: '14:10',
        location: 'School'
      },
      {
        startTime: '14:10',
        endTime: '14:30',
        location: 'Waiting For Bus'
      },
      {
        startTime: '14:30',
        endTime: '15:00',
        location: 'On Bus Home'
      },
      {
        startTime: '15:00',
        endTime: '15:30',
        location: 'Walking From Bus Stop'
      },
      {
        startTime: '15:30',
        endTime: '24:00',
        location: 'Home From School'
      }
    ]
  },
  kidB: {
    name: 'kidB',
    schedule: [
      {
        startTime: '00:00',
        endTime: '09:00',
        location: 'ome'
      },
      {
        startTime: '09:00',
        endTime: '09:15',
        location: 'Transit to School'
      },
      {
        startTime: '09:15',
        endTime: '15:35',
        location: 'School'
      },
      {
        startTime: '15:35',
        endTime: '15:50',
        location: 'Walking Home From School'
      },
      {
        startTime: '15:50',
        endTime: '24:00',
        location: 'Home From School'
      }
    ]
  }
}

const getCurrentTime = () => {
  const now = new Date()
  return now.getHours() + ':' + now.getMinutes()
}

const getScheduledLocation = (name: string) => {
  const currentTime = getCurrentTime()
  const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6
  // if (isWeekend) {
  //   return 'Weekend / At Home'
  // }
  const locationData = LOCATION_DATA[name as keyof typeof LOCATION_DATA]
  const currentLocation = locationData.schedule.find(
    (schedule: { startTime: string; endTime: string; location: string }) =>
      currentTime >= schedule.startTime && currentTime <= schedule.endTime
  )
  return currentLocation?.location || 'Unknown'
}

export default function Page({
  email,
  accessToken,
  refreshToken
}: {
  email: string | undefined
  accessToken: any
  refreshToken: any
}) {
  const [children, setChildren] = useState<{
    [key: string]: {
      name: string
      scheduledLocation: string
      isHomeFromSchool: boolean
      arrivedAt: string
      averageHomeTime: string
      schoolEndTime: string
      homeTime: string
    }
  }>({
    kidA: {
      name: 'kidA',
      scheduledLocation: '',
      isHomeFromSchool: false,
      arrivedAt: '',
      averageHomeTime: '00:00:00',
      schoolEndTime: '14:10',
      homeTime: '15:30'
    },
    kidB: {
      name: 'kidB',
      scheduledLocation: '',
      isHomeFromSchool: false,
      arrivedAt: '',
      averageHomeTime: '00:00:00',
      schoolEndTime: '15:35',
      homeTime: '15:50'
    }
  })
  const [refresh, setRefresh] = useState(0)

  const [time, setTime] = useState(
    new Date().toLocaleString('en-US', {
      timeZone: 'America/Toronto'
    })
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(
        new Date().toLocaleString('en-US', {
          timeZone: 'America/Toronto'
        })
      )
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = new Date().toLocaleString('en-US', {
          timeZone: 'America/Toronto'
        })
        const midnight = new Date(today)
        midnight.setHours(0, 0, 0, 0) // Set time to midnight

        Object.keys(children).forEach(async (child) => {
          const homeTime = new Date(today)
          homeTime.setHours(
            parseInt(children[child].homeTime.split(':')[0]),
            parseInt(children[child].homeTime.split(':')[1]),
            0,
            0
          )
          const { data: childData, error: childError } = await supabase
            .from('HomeTimes')
            .select('*')
            .eq('name', child)
            .order('created_at', { ascending: false })
            .limit(30)
          if (childError) {
            console.error(childError)
          }

          if (childData && childData.length > 0) {
            children[child].averageHomeTime = averageTimes(
              childData
                .map((data) => {
                  const dateTime = new Date(data.created_at)
                  const hours = dateTime.getHours()
                  const minutes = dateTime.getMinutes()

                  let checkInTime = hours * 60 + minutes
                  let homeTimeArray = children[child].homeTime.split(':')
                  let homeTimeInMinutes =
                    parseInt(homeTimeArray[0]) * 60 + parseInt(homeTimeArray[1])
                  let schoolEndTimeArray =
                    children[child].schoolEndTime.split(':')
                  let schoolEndTimeInMinutes =
                    parseInt(schoolEndTimeArray[0]) * 60 +
                    parseInt(schoolEndTimeArray[1])

                  if (
                    checkInTime >= schoolEndTimeInMinutes &&
                    checkInTime <= homeTimeInMinutes
                  ) {
                    console.log(data.created_at)
                    return data.created_at
                  }
                  console.log(data.created_at)
                  return null
                })
                .filter((time) => time !== null)
            )
          }
        })
        console.log(children)
        setChildren(children)
      } catch (error) {
        console.error(error)
      }
    }
    fetchData()
  }, [])

  const updateChildren = async () => {
    Object.keys(children).forEach(async (child) => {
      children[child].scheduledLocation = getScheduledLocation(child)
      if (children[child].scheduledLocation === 'Weekend / At Home') {
        children[child].isHomeFromSchool = true
      } else {
        const { arrived, arrivedAt } = await getCheckInStatus(child)
        children[child].isHomeFromSchool = arrived
        children[child].arrivedAt = new Date(arrivedAt)
          .toLocaleString()
          .split(', ')[1]
      }
    })
    setChildren(children)
  }

  useEffect(() => {
    const interval = setInterval(async () => {
      await updateChildren()
    }, 1000 * 60)
    updateChildren()
    return () => clearInterval(interval)
  }, [])

  const getCheckInStatus = async (name: string) => {
    const [hour, minute] = LOCATION_DATA[
      name as keyof typeof LOCATION_DATA
    ].schedule
      .find((schedule) => schedule.location === 'Home From School')
      ?.startTime.split(':') || ['16', '00']

    const homeTime = new Date()
    homeTime.setHours(parseInt(hour), parseInt(minute), 0, 0)

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const { data, error } = await supabase
      .from('HomeTimes')
      .select('*')
      .eq('name', name)
      .gte('created_at', today.toISOString())
      .lte('created_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
    if (error) {
      console.error(error)
    }
    if (data && data.length > 0) {
      console.log(`${name} is home from school`)
      return {
        arrived: true,
        arrivedAt: data[0].created_at
      }
    }
    return {
      arrived: false,
      arrivedAt: ''
    }
  }

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': '19rem'
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset>
        <header className='flex h-16 shrink-0 items-center gap-2 px-4'>
          <SidebarTrigger className='-ml-1' />
          <Separator orientation='vertical' className='mr-2 h-4' />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className='hidden md:block'>
                <BreadcrumbLink href='#'>Should Be Home By Now</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className='hidden md:block' />
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <h1 className='text-center text-2xl font-bold mb-3'>{time}</h1>
        <div className='flex flex-1 flex-col gap-4 p-4 pt-0'>
          <div className='grid auto-rows-min gap-4 md:grid-cols-3'>
            {Object.keys(children).map((child) => {
              return (
                <div
                  className='aspect-video rounded-xl bg-muted/50'
                  key={`child-${child}`}
                >
                  <h1>
                    <strong>Name:</strong> {children[child].name}
                  </h1>
                  <p>
                    <strong>Scheduled Location:</strong>
                    <br />
                    {children[child].scheduledLocation}
                  </p>
                  <p>
                    <strong>Actual Location:</strong>
                    <br />
                    {children[child].isHomeFromSchool
                      ? `Home From School\n ${
                          children[child].arrivedAt
                            ? `@ ${children[child].arrivedAt}`
                            : ''
                        }`
                      : 'Not Home From School'}
                  </p>
                  <p>
                    <strong>Average Home Time:</strong>
                    <br />
                    {children[child].averageHomeTime}
                  </p>
                </div>
              )
            })}
            <div className='aspect-video rounded-xl bg-muted/50' />
          </div>
          <div className='min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min' />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

function averageTimes(timestamps: string[]) {
  // Convert each timestamp to minutes since midnight
  const totalMinutes = timestamps.reduce((sum, dateTime) => {
    const time = dateTime.split('T')[1]
    const [hours, minutes] = time.split(':').map(Number)
    return sum + ((hours - 5) * 60 + minutes)
  }, 0)

  // Find average
  const averageMinutes = totalMinutes / timestamps.length

  // Convert back to HH:MM
  const avgHours = Math.floor(averageMinutes / 60) % 12
  const amPm = Math.floor(averageMinutes / 60) >= 12 ? 'PM' : 'AM'
  const avgMinutes = Math.round(averageMinutes % 60)

  // Format with leading zeros
  const formattedHours = String(avgHours).padStart(2, '0')
  const formattedMinutes = String(avgMinutes).padStart(2, '0')

  return `${formattedHours}:${formattedMinutes} ${amPm}`
}
