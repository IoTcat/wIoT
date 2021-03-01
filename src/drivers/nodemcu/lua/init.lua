if file.exists('_lfs.img') then
	file.remove('_lfs.img');
elseif file.exists('lfs.img') then
	file.rename('lfs.img', '_lfs.img');
	node.LFS.reload('_lfs.img');
end
if adc.force_init_mode(adc.INIT_ADC)
then
  node.restart()
  return
end
node.LFS.wiot()