MAKEFLAGS ?= -j4
#  loot-analysis loot-simulator  proto-explorer researches
targets = _home artifact-explorer artifact-sandbox consumption-sheet enlightenment events inventory-visualizer mission-list past-contracts rockets-tracker smart-assistant
init-targets = $(addprefix init-,$(targets))
fastbuild-targets = $(addprefix fastbuild-,$(targets))
clean-targets = $(addprefix clean-,$(targets))

.PHONY: all init clean $(targets) $(init-targets) $(clean-targets) update-loot-data

all: $(targets)

init: $(init-targets) update-loot-data

fastbuild: $(fastbuild-targets)

update-loot-data:
	curl -o _common/loot/mission_reward_count.json https://api.ei.mikit.app/mission_reward_count.json

clean: $(clean-targets)

$(init-targets): init-%:
	ets -s -f '[$@ %H:%M:%S]' $(MAKE) -C $(patsubst init-%,%,$@) init

$(targets): %:
	ets -s -f '[$@ %H:%M:%S]' $(MAKE) -C $@

$(fastbuild-targets): fastbuild-%:
	ets -s -f '[$(patsubst fastbuild-%,%,$@) %H:%M:%S]' $(MAKE) -C $(patsubst fastbuild-%,%,$@) fastbuild

$(clean-targets): clean-%:
	$(MAKE) -C $(patsubst clean-%,%,$@) clean
