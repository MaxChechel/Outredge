"""Shared clip name map. Imported by stage-videos.py and grab-posters.py.

Runnable scripts are kebab-case; this is an importable library module, so it is
snake_case — Python cannot import a hyphenated module name.
"""

# Export name -> published name. Kebab-case, prefixed with the case study slug.
# Also fixes the export's "Alphappint" typo and the one opaque Cloudinary id.
RENAME = {
    'Alphapoint-thumbnail': 'alphapoint-cover',
    'Alphapoint-Liquidity': 'alphapoint-liquidity',
    'Alphapoint-product': 'alphapoint-product',
    'Alphapoint-use-case': 'alphapoint-use-case',
    'Alphapoint-careers-slider': 'alphapoint-careers',
    'Alphappint-form': 'alphapoint-form',
    'Flight-science': 'flight-science-cover',
    'Flight-Science-2': 'flight-science-2',
    'Navy-1': 'navy-yard-dc-cover',
    'Navy-2': 'navy-yard-dc-2',
    'Navy-3': 'navy-yard-dc-3',
    'Navy-4': 'navy-yard-dc-4',
    'Navy-5': 'navy-yard-dc-5',
    'Replit-1': 'replit-agent-3-cover',
    'Replit-2': 'replit-agent-3-2',
    't6hrdy7oqmafskweombe': 'replit-agent-3-3',
    'Replit-4': 'replit-agent-3-4',
    'Replit-5': 'replit-agent-3-5',
    'Vibecon-3': 'replit-vibecon-cover',
    'Vibecon-1': 'replit-vibecon-1',
    'Vibecon-2': 'replit-vibecon-2',
    'Spherepay-Contra': 'spherepay-cover',
    'Spherepay-api-page': 'spherepay-api',
    'Spherepay-products': 'spherepay-products',
    'Spherepay-map': 'spherepay-map',
    'Tokenforge-intro': 'tokenforge-cover',
    'Tokenforge-2': 'tokenforge-2',
    'Tokenforge-lottie': 'tokenforge-lottie',
    'Tokenforge-token': 'tokenforge-token',
    'XBOW-1': 'xbow-cover',
    'XBOW-2': 'xbow-2',
    'XBOW-3': 'xbow-3',
}

# Clips belonging to withheld case studies. Kept in the map so the export stays
# fully documented, but skipped so re-running does not resurrect assets that
# were deliberately taken out of the pipeline. See drafts/README.md.
DORMANT = {'XBOW-1', 'XBOW-2', 'XBOW-3'}
