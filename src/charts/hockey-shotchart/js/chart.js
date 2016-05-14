import { scaleLinear, scaleQuantize } from 'd3-scale'
import { select } from 'd3-selection'
import 'd3-transition'
import { $ } from '../../../utils/dom'

import drawRink from './drawRink'

import {
	dimensions,
	shotRadius,
	transitionDuration,
	transitionDelay,
	missedOpacity,
	distanceFromBlueLine,
} from './config'

const { left, right, top, bottom } = dimensions
const rinkWidth = bottom - top
const rinkHeight = right - left
const rinkRatio = rinkHeight / rinkWidth
const withoutBlueLinePercent = (rinkHeight - distanceFromBlueLine) / rinkHeight

const scales = {
	playerX: scaleLinear(),
	playerY: scaleLinear(),
	color: scaleQuantize(),
}

let windowWidth = 0
let globalChartbuilder = false
const globalData = {}

// --- UPDATE ---

// update scale ranges that deal with screen size
function updateScales({ width, height }) {
	scales.playerX.range([height, 0])
	scales.playerY.range([0, width])
}

// responsive resize dom elements
function updateContainer({ width, height }) {
	select('.chart-container svg').attr('width', width).attr('height', height * withoutBlueLinePercent)
}

// // create chart key with matching size and fills
// function updateKey() {
// }

// render hexagons to chart
function updateDOM() {
	$('.shots').innerHTML = ''
	// bind data and set key
	const shots = select('.shots')
		.selectAll('.shot')
		.data(globalData.rows)

	shots.exit().remove()

	// create new a new circle
	const enterSelection = shots.enter()
		.append('circle')
			.attr('class', 'shot')

	// position, color, and scale all circles
	enterSelection.merge(shots)
		.attr('transform', d => {
			// confusing, I know.
			const y = scales.playerX(d.playerX)
			const x = scales.playerY(d.playerY)
			return `translate(${x}, ${y})`
		})
		.attr('r', shotRadius)
		.attr('cx', 0)
		.attr('cy', 0)
		.attr('class', d => {
			const className = d.made ? 'made' : 'missed'
			return `shot ${className}`
		})
		.style('opacity', 0)
		.transition()
			.duration(globalChartbuilder ? 0 : transitionDuration)
			.delay(d => d.made ? 0 : (globalChartbuilder ? 0 : transitionDelay))
			.style('opacity', d => d.made ? 1 : missedOpacity)
}

// make averages global for resize computations and update bins
function updateData({ rows, isChartbuilder }) {
	// sort rows by made / missed for rendering ordering
	const sortedRows = rows.sort((a, b) => a.made - b.made)
	// make it global so we can reuse on resize
	globalData.rows = sortedRows
	globalChartbuilder = isChartbuilder
	updateDOM()
}


// --- SETUP ---

// add containers to dom
function setupDOM() {
	const svg = select('.chart-container').select('svg')

	const outer = svg.append('g')
		.attr('class', 'outer-rink')

	outer.append('g').attr('class', 'rink')
	outer.append('g').attr('class', 'shots')

}

// basic domain/range for scales
function setupScales() {
	scales.playerX.domain([left, right])
	scales.playerY.domain([top, bottom])
}

// // setup dom for key
// function setupKey() {
// 	select('.key-average')
// 		.append('svg').attr('width', 0).attr('height', 0)
// 			.append('g').attr('class', 'hex-group')
// }

// handle resize
function handleResize() {
	if (windowWidth !== window.innerWidth) {
		windowWidth = window.innerWidth

		const width = Math.floor($('.chart-container').offsetWidth)
		const height = Math.floor(width * rinkRatio)

		updateContainer({ width, height })
		// updateKey()

		updateScales({ width, height })
		const outer = select('.outer-rink')
		const rink = select('.rink')

		// clear rink
		$('.rink').innerHTML = ''
		drawRink({ outer, rink, width, height })

		if (globalData.rows) updateDOM()
	}
}

// listen for resize event
function setupResize() {
	window.addEventListener('resize', handleResize)
}

// initialize chart
function setup() {
	setupDOM()
	setupScales()
	// setupKey()

	// things we can do once we know width
	handleResize()
	setupResize()
	// updateKey()
}

export default { setup, updateData }
