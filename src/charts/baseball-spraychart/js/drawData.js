import { select } from 'd3-selection'
import { transition } from 'd3-transition'

import colors from './../../../utils/colors.js'
import setSliderTooltip from './setSliderTooltip.js'
import setSlider from './setSlider.js'

const drawData = ({ data, detachedContainer, scales, gamedate,
uniqueDates, input, tooltip }) => {

	// if we have a gamedate, then only show data up to that gamedate
	const filteredData = gamedate ?
		data.filter(x => x.gamedate < gamedate) :
		data

	let DELAY = gamedate ? 0 : 50
	let DURATION = gamedate ? 300 : 1000

	const { x, y, origin } = scales

	// get the custom data container
	const dataContainer = select(detachedContainer)

	// JOIN
	const circles = dataContainer.selectAll('custom.circle')
		.data(filteredData, d => d.index)

	// EXIT
	circles.exit()
		.transition()
		.delay(0)
		.duration(DURATION)
		.attr('opacity', 0)
		.remove()

	// ENTER
	circles.enter().append('custom')
		.attr('class', 'circle')
		.attr('strokeStyle', d => ({
			Out: colors.gray3,
			Single: colors.redsox2,
			Double: colors.redsox2,
			Triple: colors.redsox2,
			'Home run': colors.redsox1,
		}[d.description] || colors.gray3))
		.attr('fillStyle', d => ({
			Out: colors.gray3,
			Single: colors.graypale,
			Double: colors.redsox2,
			Triple: colors.redsox2,
			'Home run': colors.redsox1,
		}[d.description] || 'white'))
		.attr('isHalf', d => d.description === 'Double')
		.attr('r', d => d.description === 'Home run' ? 8 : 5)
		.attr('cx', gamedate ? x : origin.x)
		.attr('cy', gamedate ? y : origin.y)
		.attr('opacity', 0)
		.transition()
		.delay((d, i) => i * DELAY)
		.duration(DURATION)
		.attr('cx', x)
		.attr('cy', y)
		.attr('opacity', 1)
		.on('start', d => {

			if (!gamedate) {

				const time = d.gamedate.getTime()
				const index = uniqueDates.indexOf(time)

				setSlider({ input, value: index + 1 })

				setSliderTooltip({ input, tooltip, time, index })

			}

		})
		// .each('end', (d, i) => {

		// 	// // TODO: enable slider now
		// 	// if (isInitialDraw && i === data.length - 1) {

		// 	// 	console.log('enable slider now')

		// 	// }

		// })

}

export default drawData