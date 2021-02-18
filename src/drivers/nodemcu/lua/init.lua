if file.exists('_lfs.img') then
	file.remove('_lfs.img');
elseif file.exists('lfs.img') then
	file.rename('lfs.img', '_lfs.img');
	node.LFS.reload('_lfs.img');
end
node.LFS.wiot()