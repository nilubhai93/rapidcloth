$content = Get-Content -Path 'c:\Rapidcloth\frontend\src\components\Navbar.jsx' -Raw
$startIdx = $content.IndexOf('const desktopCategories = [')
$endIdx = $content.IndexOf('  ];', $startIdx) + 4
$prefix = $content.Substring(0, $startIdx)
$suffix = $content.Substring($endIdx)
$target = $content.Substring($startIdx, $endIdx - $startIdx)

$target = $target -replace 'stroke="#[0-9a-fA-F]+"', 'stroke="currentColor"'
$target = $target -replace 'fill="#[0-9a-fA-F]+"', 'fill="currentColor"'

$newContent = $prefix + $target + $suffix
Set-Content -Path 'c:\Rapidcloth\frontend\src\components\Navbar.jsx' -Value $newContent -NoNewline
