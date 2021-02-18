local lfsindex = node.LFS and node.LFS.get or node.flashindex
local G=_ENV or getfenv()
local lfs_t
if _VERSION == 'Lua 5.1' then
    lfs_t = {
    __index = function(_, name)
        local fn_ut, ba, ma, size, modules = lfsindex(name)
        if not ba then
          return fn_ut
        elseif name == '_time' then
          return fn_ut
        elseif name == '_config' then
          local fs_ma, fs_size = file.fscfg()
          return {lfs_base = ba, lfs_mapped = ma, lfs_size = size,
                  fs_mapped = fs_ma, fs_size = fs_size}
        elseif name == '_list' then
          return modules
        else
          return nil
        end
      end,
    __newindex = function(_, name, value)
        error("LFS is readonly. Invalid write to LFS." .. name, 2)
      end,
    }
    setmetatable(lfs_t,lfs_t)
    G.module       = nil
    package.seeall = nil
else
    lfs_t = node.LFS
end
G.LFS = lfs_t
package.loaders[3] = function(module)
  return lfs_t[module]
end
local lf = loadfile
G.loadfile = function(n)
  if file.exists(n) then return lf(n) end
  local mod = n:match("(.*)%.l[uc]a?$")
  local fn  = mod and lfsindex(mod)
  return (fn or error (("Cannot find '%s' in FS or LFS"):format(n))) and fn
end
G.dofile = function(n) return assert(loadfile(n))() end