<script setup>
import { getAccesToken } from '#imports';

const userActivityData = ref([])
const config = useRuntimeConfig()

onBeforeMount(() => {
    fetchUserActivityData()
        .then((data) => {
            userActivityData.value.push(createUserActivityData(data.content))
        })
})

function createUserActivityData(array) {
    //interval in minutes
    const interval = 60
    const data = []

    for (let i = 0; i < array.length - 1; i++) {
        const difference = ((new Date(array[i].timestamp) - new Date(array[i + 1].timestamp)) / 1000 / 60).toFixed(0)
        if (difference <= interval) {
            data.push([new Date(array[i].timestamp), array[i].userCount])
        }

        if (difference > interval) {
            const insertions = difference / 60
            for (let j = 0; j < insertions; j++) {
                data.push([new Date(new Date(array[i].timestamp) - (60 * 60 * 1000) * j), 0])
            }
        }
    }

    return { data: data }
}

async function fetchUserActivityData() {
    return fetch(config.public.baseURL + '/users/activity', {
        method: "GET",
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${await getAccesToken()}`
        }
    })
        .then((data) => data.json())
}

const chartOptions = {
    chart: {
        id: 'area-datetime',
        type: 'area',
        height: 400,
        zoom: {
            autoScaleYaxis: true
        },
    },
    stroke: {
        curve: 'smooth',
        width: 2,
    },
    colors: ['#f44336'],
    annotations: {
        yaxis: [{
            y: 30,
            borderColor: '#999',
            labels: {
                show: true,
                style: {
                    color: '#ffffff'
                }
            }
        }],
        xaxis: [{
            x: new Date('14 Nov 2012').getTime(),
            borderColor: '#999',
            yAxisIndex: 0,
            label: {
                show: true,
                text: 'Rally',
                style: {
                    color: "#121212",
                    background: '#121212'
                }
            }
        }]
    },
    dataLabels: {
        enabled: false
    },
    xaxis: {
        type: 'datetime',
        min: new Date().getTime() - 1000 * 60 * 60 * 24 * 30,
        tickAmount: 1,
        labels: {
            style: {
                colors: '#ffffff',
                fontSize: '16px',
            }
        }
    },
    yaxis: {
        labels: {
            style: {
                colors: "#ffffff",
                fontSize: '16px',
            },
            formatter: (value) => Math.floor(value),
        }
    },
    tooltip: {
        x: {
            format: 'dd MMM yyyy HH:mm'
        },
        y: {
            formatter: 'undefined',
            title: {
                formatter: () => 'Active users:',
            },
        },
        theme: 'dark',
        style: {
            color: '#121212',
            background: '#121212'
        }
    },
    fill: {
        type: 'gradient',
        gradient: {
            shadeIntensity: 0.1,
            opacityFrom: 0.7,
            opacityTo: 0,
        }
    },
}
</script>

<template>
    <div>
        <apexchart :key="userActivityData" height="250px" width="100%" :options="chartOptions"
            :series="userActivityData">
        </apexchart>
    </div>
</template>

<style scoped></style>