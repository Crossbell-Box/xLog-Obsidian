import { addIcon } from 'obsidian'

export function getLogoIconName() {
	return 'xlog-logo' as const
}

export function getLogoSvgText() {
	return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 128.81 128.17">
  <defs>
    <style>
      .cls-1 {
        fill: url(#gradient3);
      }
    </style>
    <linearGradient id="gradient3" x1="57.54" y1="31.44" x2="128.81" y2="31.44" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#ff4d4d"/>
      <stop offset=".99" stop-color="#f9cb28"/>
    </linearGradient>
  </defs>
  <g id="b">
    <g>
      <path fill="currentColor" d="M56.32,100.47c0,15.98-11.84,27.61-27.85,27.61S.33,116.45,.33,100.47s11.83-27.45,28.08-27.45,27.91,11.63,27.91,27.45Z"/>
      <path fill="currentColor" d="M120,101.26v19.31c-4.87,4.63-12.9,7.6-21.65,7.6-18.33,0-30-10.49-30-26.7s12.92-28.34,31.07-28.34v28.13h20.58Z"/>
      <polygon class="cls-1" points="119.7 21.48 128.81 38.51 83.27 62.88 57.54 14.79 85.17 0 101.79 31.06 119.7 21.48"/>
      <polygon fill="currentColor" points="0 63.11 16.54 32.82 .68 8.17 55.98 8.17 40.12 32.82 56.65 63.11 0 63.11"/>
    </g>
  </g>
</svg>`
}

/**
 * This adds `xlog-logo` to the list of icons that can be used in Obsidian.
 */
export function addLogoIcon() {
	return addIcon(getLogoIconName(), getLogoSvgText())
}
