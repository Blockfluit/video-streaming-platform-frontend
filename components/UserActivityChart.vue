<script setup>
import { useJwtStore } from '~/stores/jwtStore';

const jwtStore = useJwtStore()
const userActivityData = ref([])
const config = useRuntimeConfig()

onBeforeMount(() => {
    fetch(config.public.baseURL + '/users/activity', {
        method: "GET",
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${jwtStore.jwt}`
        }
    })
        .then((data) => data.json())
        .then((data) => {
            userActivityData.value.push({ data: data.content.map((data) => [new Date(data.timestamp).getTime(), data.userCount]) })
            console.log(userActivityData.value)
        })
})

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
        <apexchart :key="userActivityData" height="250px" width="100%" :options="chartOptions" :series="userActivityData">
        </apexchart>
    </div>
</template>

<style scoped></style>