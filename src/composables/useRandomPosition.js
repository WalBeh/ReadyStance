const MIN_DISTANCE = 25

export function createPositionTracker() {
  const recentPositions = []

  return function randomPosition(avoidX = null, avoidY = null) {
    let bestX, bestY, bestDist = -1

    for (let attempt = 0; attempt < 20; attempt++) {
      const candidateX = 10 + Math.random() * 80
      const candidateY = 10 + Math.random() * 80

      let minDistSq = Infinity
      for (const pos of recentPositions) {
        const dx = candidateX - pos.x
        const dy = candidateY - pos.y
        minDistSq = Math.min(minDistSq, dx * dx + dy * dy)
      }

      if (avoidX !== null) {
        const dx = candidateX - avoidX
        const dy = candidateY - avoidY
        minDistSq = Math.min(minDistSq, dx * dx + dy * dy)
      }

      const thresholdSq = MIN_DISTANCE * MIN_DISTANCE

      if ((recentPositions.length === 0 && avoidX === null) || minDistSq >= thresholdSq) {
        bestX = candidateX
        bestY = candidateY
        break
      }

      if (minDistSq > bestDist) {
        bestDist = minDistSq
        bestX = candidateX
        bestY = candidateY
      }
    }

    recentPositions.push({ x: bestX, y: bestY })
    if (recentPositions.length > 3) {
      recentPositions.shift()
    }

    return { x: bestX, y: bestY }
  }
}
