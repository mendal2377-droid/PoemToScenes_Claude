/**
 * Movement from the on-screen thumbstick.
 *
 * A plain module object, not React state: the walk loop reads it every frame,
 * and re-rendering the tree at frame rate to move a figure would be absurd.
 * Same reasoning as the shared uniform block in the renderer.
 */
export const touchInput = { x: 0, y: 0, active: false };
